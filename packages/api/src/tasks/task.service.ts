import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Task, TaskRelationTypeEnum, TaskStatusLog } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { TaskResponse, TaskSchema } from 'shared/src/dto/tasks.dto';

import { PrismaService } from '../prisma/prisma.service';
import { TaskActivityService } from '../task-activities/task-activity.service';
import {
  CreateTaskDto,
  LogTaskStatusDto,
  TaskDto,
  TaskFilterDto,
  TaskListResponseDto,
  UpdateLogTaskStatusDto,
  UpdateTaskDto,
} from './dto/task.dto';
import { UserPayload } from '../auth/dto/auth.dto';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  constructor(
    private prisma: PrismaService,
    private taskActivityService: TaskActivityService,
  ) {}

  private async getUserProjectIds(accountId: string): Promise<string[]> {
    const projects = await this.prisma.project.findMany({
      where: { accountId },
      select: { id: true },
    });

    return projects.map((p: { id: string }) => p.id);
  }

  private async generateTaskKey(projectKey: string): Promise<string> {
    // Use a transaction with serializable isolation to prevent race conditions
    return await this.prisma.$transaction(
      async (tx) => {
        const projectTasks = await tx.task.count({
          where: { project: { projectKey } },
        });
        const taskCount = projectTasks + 1;
        return `${projectKey}-${taskCount}`;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  private async findOrCreateTaskStatus(
    status: string,
  ): Promise<string | undefined> {
    try {
      let taskStatus = await this.prisma.taskStatus.findFirst({
        where: { label: status },
        select: { id: true },
      });

      if (!taskStatus) {
        taskStatus = await this.prisma.taskStatus.create({
          data: { label: status, code: status },
          select: { id: true },
        });
      }

      return taskStatus.id;
    } catch (error) {
      this.logger.error(
        `Failed to find or create status '${status}': ${(error as Error).message}`,
      );
      throw new BadRequestException(`Invalid status: ${status}`);
    }
  }

  async createTask(dto: CreateTaskDto, user: UserPayload): Promise<Task> {
    this.logger.log(
      `Creating task with title: ${dto.title}, type: ${dto.type}, projectId: ${dto.projectId}`,
    );
    await this.validateTaskType(dto.type, dto.parentId, null, user);

    // Validate project belongs to user's account (optimized)
    const project = await this.prisma.project.findUniqueOrThrow({
      where: {
        id: dto.projectId,
        accountId: user.account.id,
      },
      select: {
        id: true,
        projectKey: true,
        _count: {
          select: { tasks: true },
        },
      },
    });

    const taskKey = await this.generateTaskKey(project.projectKey);

    // Handle task status - find existing or create if needed
    let statusId: string | undefined;
    if (dto.status) {
      statusId = await this.findOrCreateTaskStatus(dto.status);
    }

    const task = await this.prisma.task.create({
      data: {
        title: dto.title, // Ensure required field is present
        description: dto.description,
        type: dto.type,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        project: { connect: { id: project.id } },
        creator: { connect: { id: user.userId } },
        assignee: dto.assigneeId
          ? { connect: { id: dto.assigneeId } }
          : undefined,
        team: dto.teamId ? { connect: { id: dto.teamId } } : undefined,
        parent: dto.parentId ? { connect: { id: dto.parentId } } : undefined,
        TaskStatus: statusId ? { connect: { id: statusId } } : undefined,
        taskKey,
      },
      include: {
        project: true,
        creator: true,
        assignee: true,
        TaskStatus: true,
        team: true,
        parent: true,
      },
    });
    await this.taskActivityService.logActivity(
      {
        taskId: task.id,
        userId: user.userId,
        action: 'created',
      },
      user,
    );
    if (dto.relatedTasks?.length) {
      await this.createRelations(task, dto.relatedTasks, user);
    }
    return task;
  }

  private async createRelations(
    task: Task,
    relations: { taskId: string; relationType: TaskRelationTypeEnum }[],
    user: UserPayload,
  ) {
    if (!relations.length) return;
    await this.validateAndCreateTaskRelations(
      task.id,
      relations,
      user,
      this.prisma,
    );
  }

  private async validateAndCreateTaskRelations(
    sourceTaskId: string,
    relations: { taskId: string; relationType: TaskRelationTypeEnum }[],
    user: UserPayload,

    prismaClient: any = this.prisma,
  ) {
    // Bulk validate all related tasks to avoid N+1 queries
    const relatedTaskIds = relations.map((rel) => rel.taskId);
    const relatedTasks = await prismaClient.task.findMany({
      where: {
        id: { in: relatedTaskIds },
        project: {
          accountId: user.account.id,
        },
      },
      select: { id: true },
    });

    const foundTaskIds = new Set(relatedTasks.map((t) => t.id as string));
    const missingTaskIds = relatedTaskIds.filter((id) => !foundTaskIds.has(id));

    if (missingTaskIds.length > 0) {
      throw new NotFoundException(
        `Related tasks not found: ${missingTaskIds.join(', ')}`,
      );
    }

    // Bulk create all relations
    const relationData = relations.map((rel) => ({
      taskId: sourceTaskId,
      relatedTaskId: rel.taskId,
      relationType: rel.relationType,
    }));

    await prismaClient.taskRelation.createMany({
      data: relationData,
      skipDuplicates: true,
    });
  }

  private async validateTaskType(
    type: string,
    parentId: string | undefined,
    existingParentId: string | null,
    user?: UserPayload,
  ): Promise<void> {
    if (type === 'subtask' && !parentId && !existingParentId) {
      throw new BadRequestException('Subtask must have a parent');
    }
    if (type === 'epic' && (parentId || existingParentId)) {
      throw new BadRequestException('Epics cannot have a parent');
    }
    if (parentId && user) {
      const parent = await this.prisma.task.findUniqueOrThrow({
        where: {
          id: parentId,
          project: {
            accountId: user.account.id,
          },
        },
        select: { type: true },
      });
      if (parent.type === 'subtask') {
        throw new BadRequestException('Subtasks cannot be parents');
      }
    } else if (parentId) {
      // Fallback for backward compatibility when user is not provided
      const parent = await this.prisma.task.findUniqueOrThrow({
        where: { id: parentId },
        select: { type: true },
      });
      if (parent.type === 'subtask') {
        throw new BadRequestException('Subtasks cannot be parents');
      }
    }
  }

  private async getRelatedTasks(
    taskId: string,
    user: UserPayload,
  ): Promise<TaskResponse[]> {
    // Get all task IDs related to this task in both directions
    const relations = await this.prisma.taskRelation.findMany({
      where: {
        OR: [{ taskId }, { relatedTaskId: taskId }],
      },
      select: {
        taskId: true,
        relatedTaskId: true,
      },
    });

    // Extract unique related task IDs
    const relatedTaskIds = new Set<string>();
    relations.forEach((rel) => {
      if (rel.taskId === taskId) {
        relatedTaskIds.add(rel.relatedTaskId);
      } else if (rel.relatedTaskId === taskId) {
        relatedTaskIds.add(rel.taskId);
      }
    });

    if (relatedTaskIds.size === 0) {
      return [];
    }

    // Fetch all related tasks with account validation in a single query
    const rawTasks = await this.prisma.task.findMany({
      where: {
        id: { in: Array.from(relatedTaskIds) },
        project: {
          accountId: user.account.id,
        },
      },
      select: {
        id: true,
        title: true,
        taskKey: true,
        type: true,
        priority: true,
        TaskStatus: true,
        createdAt: true,
        updatedAt: true,
        description: true,
        assigneeId: true,
        creatorId: true,
        parentId: true,
        projectId: true,
        teamId: true,
        dueDate: true,
        project: {
          select: {
            projectKey: true,
          },
        },
      },
    });

    // Transform and validate using Zod schema
    return rawTasks.map((task) =>
      TaskSchema.parse({
        id: task.id,
        projectKey: task.project.projectKey,
        title: task.title,
        description: task.description,
        assigneeId: task.assigneeId,
        taskKey: task.taskKey,
        creatorId: task.creatorId,
        parentId: task.parentId,
        priority: task.priority,
        projectId: task.projectId,
        teamId: task.teamId,
        type: task.type,
        status: task.TaskStatus.code,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }),
    );
  }

  private async getTasksByProject(
    projectId: string,
    user: UserPayload,
    pagination: { limit?: number; offset?: number } = {},
  ): Promise<Task[]> {
    const { limit = 100, offset = 0 } = pagination;

    return await this.prisma.task.findMany({
      where: {
        projectId,
        project: {
          accountId: user.account.id,
        },
      },
      include: {
        assignee: true,
        creator: true,
        team: true,
        project: true,
        parent: true,
        sourceRelations: true,
        targetRelations: true,
        TaskStatus: true,
      },
      take: Math.min(limit, 500), // Cap at 500 for safety
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  private async logTaskChanges(
    task: Task,
    dto: Partial<TaskDto>,
    user: UserPayload,
  ): Promise<void> {
    await this.logFieldChanges(task, dto, user);
    await this.logRelatedTasksChanges(task, dto, user);
  }

  private async logFieldChanges(
    task: Task,
    dto: Partial<TaskDto>,
    user: UserPayload,
  ): Promise<void> {
    const keysToTrack: (keyof TaskDto)[] = [
      'title',
      'storyPoints',
      'description',
      'status',
      'priority',
      'type',
      'assigneeId',
      'teamId',
      'parentId',
      'dueDate',
    ];

    for (const key of keysToTrack) {
      if (dto[key] === undefined) continue;

      const oldValue = this.normalizeLogValue(task[key]);
      const newValue = this.normalizeLogValue(dto[key]);

      if (this.hasValueChanged(oldValue, newValue)) {
        await this.taskActivityService.logActivity(
          {
            taskId: task.id,
            userId: user.userId,
            action: 'updated',
            field: key as string,
            oldValue: this.formatLogValue(oldValue),
            newValue: this.formatLogValue(newValue),
          },
          user,
        );
      }
    }
  }

  private async logRelatedTasksChanges(
    task: Task,
    dto: Partial<TaskDto>,
    user: UserPayload,
  ): Promise<void> {
    if (dto.relatedTasks === undefined) return;

    const currentRelatedTasks = await this.getRelatedTasks(task.id, user);
    const currentIds = currentRelatedTasks
      .map((t) => t.id)
      .sort()
      .join(',');

    const newIds = (dto.relatedTasks || [])
      .map((t) => String(t.taskId))
      .sort()
      .join(',');

    if (currentIds !== newIds) {
      await this.taskActivityService.logActivity(
        {
          taskId: task.id,
          userId: user.userId,
          action: 'updated',
          field: 'relatedTasks',
          oldValue: JSON.stringify(currentRelatedTasks),
          newValue: JSON.stringify(dto.relatedTasks || []),
        },
        user,
      );
    }
  }

  private normalizeLogValue(value: unknown): string | number | null {
    if (value === null || value === undefined) return null;
    if (value instanceof Date) return value.toISOString();
    return value as string | number | null;
  }

  private hasValueChanged(oldValue: unknown, newValue: unknown): boolean {
    return (
      oldValue !== newValue && !(oldValue === null && newValue === undefined)
    );
  }

  private formatLogValue(value: string | number | null): string {
    return value === null ? 'null' : String(value);
  }

  async getTaskWithHierarchy(id: string, user: UserPayload): Promise<Task> {
    return await this.prisma.task.findUniqueOrThrow({
      where: {
        id,
        project: {
          accountId: user.account.id,
        },
      },
      include: {
        parent: true,
        children: {
          include: {
            children: true,
          },
        },
        sourceRelations: true,
        creator: true,
        assignee: true,
      },
    });
  }

  async update(
    taskId: string,
    dto: UpdateTaskDto,
    user: UserPayload,
  ): Promise<Task> {
    const task = await this.prisma.task.findUniqueOrThrow({
      where: {
        id: taskId,
        project: {
          accountId: user.account.id,
        },
      },
      include: {
        assignee: true,
        creator: true,
        team: true,
        project: true,
        parent: true,
        sourceRelations: true,
        targetRelations: true,
      },
    });

    if (dto.type || dto.parentId !== undefined) {
      await this.validateTaskType(
        dto.type || task.type,
        dto.parentId ?? task.parent?.id,
        task.parent?.id,
        user,
      );
    }
    await this.logTaskChanges(task, dto, user);
    const updatedData: Partial<Task> = {
      ...('title' in dto && { title: dto.title }),
      ...('description' in dto && { description: dto.description }),
      ...('priority' in dto && { priority: dto.priority }),
      ...('type' in dto && { type: dto.type }),
      ...('storyPoints' in dto && { storyPoints: dto.storyPoints }),
      ...('status' in dto && { status: dto.status }),
      ...('dueDate' in dto && {
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      }),
      ...('projectId' in dto && { projectId: dto.projectId }),
      ...('assigneeId' in dto &&
        (dto.assigneeId
          ? { assignee: { connect: { id: dto.assigneeId } } }
          : { assignee: { disconnect: true } })),
      ...('teamId' in dto &&
        (dto.teamId
          ? { team: { connect: { id: dto.teamId } } }
          : { team: { disconnect: true } })),
      ...('parentId' in dto &&
        (dto.parentId
          ? { parent: { connect: { id: dto.parentId } } }
          : { parent: { disconnect: true } })),
    };
    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: updatedData,
    });
    // Handle related tasks with transaction to prevent race conditions
    if (dto.relatedTasks) {
      await this.prisma.$transaction(async (tx) => {
        await tx.taskRelation.deleteMany({
          where: { taskId: task.id },
        });

        if (dto.relatedTasks && dto.relatedTasks.length > 0) {
          await this.validateAndCreateTaskRelations(
            task.id,
            dto.relatedTasks,
            user,
            tx,
          );
        }
      });
    }
    return updatedTask;
  }

  async logStatus(
    taskId: string,
    dto: LogTaskStatusDto,
    user: UserPayload,
  ): Promise<TaskStatusLog> {
    await this.prisma.task.findUniqueOrThrow({
      where: {
        id: taskId,
        project: {
          accountId: user.account.id,
        },
      },
      select: { id: true },
    });

    return await this.prisma.taskStatusLog.create({
      data: {
        task: { connect: { id: taskId } },
        status: dto.status,
        location: dto.location,
        updatedBy: dto.updatedById
          ? { connect: { id: dto.updatedById } }
          : undefined,
      },
    });
  }

  async updateLogStatus(
    logStatusId: string,
    dto: UpdateLogTaskStatusDto,
  ): Promise<TaskStatusLog> {
    return await this.prisma.taskStatusLog.update({
      where: { id: logStatusId },
      data: {
        status: dto.status,
        location: dto.location,
        updatedBy: dto.updatedById
          ? { connect: { id: dto.updatedById } }
          : undefined,
      },
    });
  }

  async findAll(
    filters: TaskFilterDto,
    user: UserPayload,
  ): Promise<TaskListResponseDto> {
    const startTime = Date.now();

    const pagination = this.buildPagination(filters);
    const userProjectIds = await this.validateAndGetProjectIds(
      filters.projectId,
      user,
    );
    const where = this.buildTaskWhereClause(filters, userProjectIds);
    const orderBy = this.buildTaskOrderBy(filters);

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        orderBy,
        skip: pagination.skip,
        take: pagination.limit,
        include: this.getTaskListIncludes(),
      }),
      this.prisma.task.count({ where }),
    ]);

    this.logQueryPerformance(startTime, filters, tasks.length, user.userId);

    return {
      tasks,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  private buildPagination(filters: TaskFilterDto) {
    const validLimit = filters.limit || 20;
    const validPage = filters.page || 1;
    const cappedLimit = Math.min(validLimit, 50);
    const skip = (validPage - 1) * cappedLimit;

    return {
      page: validPage,
      limit: cappedLimit,
      skip,
    };
  }

  private async validateAndGetProjectIds(
    projectId: string | undefined,
    user: UserPayload,
  ): Promise<string[]> {
    if (projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: projectId, accountId: user.account.id },
        select: { id: true },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
      return [projectId];
    }
    return this.getUserProjectIds(user.account.id);
  }

  private buildTaskWhereClause(
    filters: TaskFilterDto,
    userProjectIds: string[],
  ): Prisma.TaskWhereInput {
    const {
      search,
      assigneeId,
      creatorId,
      teamId,
      parentId,
      status,
      priority,
      type,
      dueDateFrom,
      dueDateTo,
      createdFrom,
      createdTo,
      hasParent,
      isOverdue,
    } = filters;

    const now = new Date();
    const defaultCreatedFrom = this.getDefaultCreatedFrom(filters);

    return {
      projectId: { in: userProjectIds },
      ...(assigneeId && { assigneeId }),
      ...(creatorId && { creatorId }),
      ...(teamId && { teamId }),
      ...(parentId && { parentId }),
      ...(status && { TaskStatus: { code: status } }),
      ...(priority && { priority }),
      ...(type && { type }),
      ...(dueDateFrom && { dueDate: { gte: dueDateFrom } }),
      ...(dueDateTo && { dueDate: { lte: dueDateTo } }),
      ...(createdFrom && { createdAt: { gte: createdFrom } }),
      ...(createdTo && { createdAt: { lte: createdTo } }),
      ...(hasParent !== undefined && {
        parentId: hasParent ? { not: null } : null,
      }),
      ...(isOverdue && {
        dueDate: { lt: now },
        TaskStatus: { code: { not: 'done' } },
      }),
      ...this.buildSearchClause(search),
      ...(defaultCreatedFrom && { createdAt: { gte: defaultCreatedFrom } }),
    };
  }

  private getDefaultCreatedFrom(filters: TaskFilterDto): Date | undefined {
    const { createdFrom, createdTo, dueDateFrom, dueDateTo } = filters;
    return !createdFrom && !createdTo && !dueDateFrom && !dueDateTo
      ? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
      : undefined;
  }

  private buildSearchClause(search?: string): Prisma.TaskWhereInput {
    if (!search || search.length < 3) return {};

    return {
      OR: [
        { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { taskKey: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ...(search.length >= 5
          ? [
              {
                description: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ]
          : []),
      ],
    };
  }

  private buildTaskOrderBy(
    filters: TaskFilterDto,
  ): Prisma.TaskOrderByWithRelationInput {
    const validSortBy = filters.sortBy || 'createdAt';
    const validSortOrder = filters.sortOrder || 'desc';
    return { [validSortBy]: validSortOrder };
  }

  private getTaskListIncludes() {
    return {
      project: { select: { name: true, projectKey: true } },
      assignee: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      team: { select: { id: true, name: true } },
      parent: { select: { id: true, title: true, taskKey: true } },
      TaskStatus: {
        select: { id: true, code: true, label: true, color: true },
      },
      _count: {
        select: { children: true, comments: true, attachments: true },
      },
    };
  }

  private getTaskDetailIncludes() {
    return {
      project: { select: { name: true, projectKey: true } },
      assignee: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      team: { select: { id: true, name: true } },
      parent: { select: { id: true, title: true, taskKey: true } },
      TaskStatus: {
        select: { id: true, code: true, label: true, color: true },
      },
      children: {
        select: {
          id: true,
          title: true,
          taskKey: true,
          statusId: true,
          priority: true,
        },
        include: {
          TaskStatus: { select: { code: true, label: true } },
        },
      },
      sourceRelations: {
        include: {
          relatedTask: {
            select: {
              id: true,
              title: true,
              taskKey: true,
              statusId: true,
            },
          },
        },
      },
      targetRelations: {
        include: {
          sourceTask: {
            select: {
              id: true,
              title: true,
              taskKey: true,
              statusId: true,
            },
          },
        },
      },
      comments: {
        orderBy: { createdAt: Prisma.SortOrder.desc },
        take: 5,
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
      attachments: {
        select: {
          id: true,
          fileName: true,
          fileType: true,
          fileSize: true,
          createdAt: true,
        },
      },
    };
  }

  private logQueryPerformance(
    startTime: number,
    filters: TaskFilterDto,
    resultCount: number,
    userId: string,
  ): void {
    const queryDuration = Date.now() - startTime;

    if (queryDuration > 1000) {
      this.logger.warn(`Slow task query detected: ${queryDuration}ms`, {
        filters: JSON.stringify(filters),
        resultCount,
        userId,
      });
    } else if (queryDuration > 500) {
      this.logger.log(`Task query took ${queryDuration}ms`, {
        resultCount,
        hasSearch: !!filters.search,
        hasComplexFilters: !!(
          filters.status ||
          filters.priority ||
          filters.type ||
          filters.assigneeId
        ),
      });
    }
  }

  async findOne(id: string, user: UserPayload): Promise<Task> {
    return await this.prisma.task.findUniqueOrThrow({
      where: {
        id,
        project: {
          accountId: user.account.id,
        },
      },
      include: this.getTaskDetailIncludes(),
    });
  }

  async findByProject(
    projectId: string,
    filters: Omit<TaskFilterDto, 'projectId'>,
    user: UserPayload,
  ): Promise<TaskListResponseDto> {
    // Project validation is now handled in findAll method
    return this.findAll({ ...filters, projectId }, user);
  }

  async findAssignedToUser(
    filters: Omit<TaskFilterDto, 'assigneeId'>,
    user: UserPayload,
  ): Promise<TaskListResponseDto> {
    return this.findAll({ ...filters, assigneeId: user.userId }, user);
  }

  async findCreatedByUser(
    filters: Omit<TaskFilterDto, 'creatorId'>,
    user: UserPayload,
  ): Promise<TaskListResponseDto> {
    return this.findAll({ ...filters, creatorId: user.userId }, user);
  }

  async remove(id: string, user: UserPayload): Promise<void> {
    // Get user's project IDs for optimized filtering
    const userProjectIds = await this.getUserProjectIds(user.account.id);

    const task = await this.prisma.task.findUniqueOrThrow({
      where: {
        id,
        projectId: { in: userProjectIds },
      },
      include: {
        children: true,
      },
    });

    // Check if task has children
    if (task.children.length > 0) {
      throw new BadRequestException(
        'Cannot delete task with subtasks. Delete or reassign subtasks first.',
      );
    }

    // Log activity before deletion
    await this.taskActivityService.logActivity(
      {
        taskId: task.id,
        userId: user.userId,
        action: 'deleted',
      },
      user,
    );

    await this.prisma.task.delete({
      where: { id },
    });
  }
}
