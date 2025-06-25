import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Task, TaskRelationTypeEnum, TaskStatusLog } from '@prisma/client';
import { Prisma } from '@prisma/client';

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
    const projectTasks = await this.prisma.task.count({
      where: { project: { projectKey } },
    });
    const taskCount = projectTasks + 1; // Start from 1
    return `${projectKey}-${taskCount}`;
  }

  async createTask(dto: CreateTaskDto, user: UserPayload): Promise<Task> {
    this.logger.log(
      `Creating task with title: ${dto.title}, type: ${dto.type}, projectId: ${dto.projectId}`,
    );
    await this.validateTaskType(
      dto.type as string,
      dto.parentId as string,
      null,
    );

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

    // Handle task status - try to find existing or create if needed
    let statusId: string | undefined;
    if (dto.status) {
      let taskStatus = await this.prisma.taskStatus.findFirst({
        where: { label: dto.status },
      });

      // If status doesn't exist, create it
      if (!taskStatus) {
        try {
          taskStatus = await this.prisma.taskStatus.create({
            data: { label: dto.status, code: dto.status },
          });
        } catch (error) {
          this.logger.warn(
            `Could not create status '${dto.status}': ${(error as Error).message}`,
          );
        }
      }

      if (taskStatus) {
        statusId = taskStatus.id;
      }
    }

    const task = await this.prisma.task.create({
      data: {
        title: dto.title, // Ensure required field is present
        description: dto.description,
        type: dto.type,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate as Date) : undefined,
        project: { connect: { id: project.id } },
        creator: { connect: { id: user.userId } },
        assignee: dto.assigneeId
          ? { connect: { id: dto?.assigneeId as string } }
          : undefined,
        team: dto.teamId
          ? { connect: { id: dto?.teamId as string } }
          : undefined,
        parent: dto.parentId
          ? { connect: { id: dto?.parentId as string } }
          : undefined,
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
      await this.createRelations(
        task,
        dto.relatedTasks as {
          taskId: string;
          relationType: TaskRelationTypeEnum;
        }[],
        user,
      );
    }
    return task;
  }

  private async createRelations(
    task: Task,
    relations: { taskId: string; relationType: TaskRelationTypeEnum }[],
    user: UserPayload,
  ) {
    for (const rel of relations) {
      const relatedTask = await this.prisma.task.findUnique({
        where: {
          id: rel.taskId,
          project: {
            accountId: user.account.id,
          },
        },
      });
      if (!relatedTask) {
        throw new NotFoundException(
          `Related task with ID ${rel.taskId} not found`,
        );
      }
      await this.prisma.taskRelation.create({
        data: {
          sourceTask: { connect: { id: task.id } },
          relatedTask: { connect: { id: relatedTask.id } },
          relationType: rel.relationType,
        },
      });
    }
  }

  private async validateTaskType(
    type: string,
    parentId: string | undefined,
    existingParentId: string | null,
  ): Promise<void> {
    if (type === 'subtask' && !parentId && !existingParentId) {
      throw new BadRequestException('Subtask must have a parent');
    }
    if (type === 'epic' && (parentId || existingParentId)) {
      throw new BadRequestException('Epics cannot have a parent');
    }
    if (parentId) {
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
  ): Promise<Task[]> {
    const relations = await this.prisma.taskRelation.findMany({
      where: {
        OR: [{ taskId }, { relatedTaskId: taskId }],
        AND: [
          {
            sourceTask: {
              project: {
                accountId: user.account.id,
              },
            },
          },
          {
            relatedTask: {
              project: {
                accountId: user.account.id,
              },
            },
          },
        ],
      },
      include: {
        sourceTask: true,
        relatedTask: true,
      },
    });

    const taskMap = new Map<string, Task>();

    relations.forEach((rel) => {
      // Add the related task if this task is the source
      if (rel.taskId === taskId && rel.relatedTask) {
        taskMap.set(rel.relatedTask.id, rel.relatedTask);
      }
      // Add the source task if this task is the related
      else if (rel.relatedTaskId === taskId && rel.sourceTask) {
        taskMap.set(rel.sourceTask.id, rel.sourceTask);
      }
    });

    return Array.from(taskMap.values());
  }

  private async getTasksByProject(
    projectId: string,
    user: UserPayload,
  ): Promise<Task[]> {
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
      },
    });
  }

  private async logTaskChanges(
    task: Task,
    dto: Partial<TaskDto>,
    user: UserPayload,
  ): Promise<void> {
    const toLogValue = (value: string | number | Date | null): string =>
      value === null ? 'null' : String(value);

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
      const oldRaw = task[key];
      const newRaw = dto[key];
      if (newRaw === undefined) continue;

      const oldValue =
        oldRaw instanceof Date
          ? oldRaw.toISOString()
          : (oldRaw as string | number | null);
      const newValue =
        newRaw instanceof Date
          ? newRaw.toISOString()
          : (newRaw as string | number | null);

      if (
        oldValue !== newValue &&
        !(oldValue === null && newValue === undefined)
      ) {
        await this.taskActivityService.logActivity(
          {
            taskId: task.id,
            userId: user.userId,
            action: 'updated',
            field: key as string,
            oldValue: toLogValue(oldValue),
            newValue: toLogValue(newValue),
          },
          user,
        );
      }
    }

    if (dto.relatedTasks !== undefined) {
      const currentRelatedTasks = await this.getRelatedTasks(task.id, user);
      const currentIdsArray = currentRelatedTasks.map((t): string =>
        String(t.id),
      );
      const currentIds = currentIdsArray.sort().join(',');

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
        dueDate: dto.dueDate ? new Date(dto.dueDate as Date) : null,
      }),
      ...('projectId' in dto && { projectId: dto.projectId }),
      ...('assigneeId' in dto &&
        (dto.assigneeId
          ? { assignee: { connect: { id: dto.assigneeId as string } } }
          : { assignee: { disconnect: true } })),
      ...('teamId' in dto &&
        (dto.teamId
          ? { team: { connect: { id: dto.teamId as string } } }
          : { team: { disconnect: true } })),
      ...('parentId' in dto &&
        (dto.parentId
          ? { parent: { connect: { id: dto.parentId as string } } }
          : { parent: { disconnect: true } })),
    };
    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: updatedData,
    });
    if (dto.relatedTasks) {
      await this.prisma.taskRelation.deleteMany({
        where: { taskId: task.id },
      });
      await this.createRelations(task, dto.sourceRelations, user);
    }
    return updatedTask;
  }

  async logStatus(
    taskId: string,
    dto: LogTaskStatusDto,
    user: UserPayload,
  ): Promise<TaskStatusLog> {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
        project: {
          accountId: user.account.id,
        },
      },
    });
    if (!task) throw new NotFoundException('Task not found');
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
    const statusLog = await this.prisma.taskStatusLog.findUnique({
      where: { id: logStatusId },
    });

    if (!statusLog) throw new NotFoundException('Status Log not found');

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

    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      projectId,
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

    // Cap the limit to prevent large queries with safety checks
    const validLimit = limit || 20;
    const validPage = page || 1;
    const cappedLimit = Math.min(validLimit, 50);
    const skip = (validPage - 1) * cappedLimit;
    const now = new Date();

    // Get user's project IDs for optimized filtering
    let userProjectIds: string[];
    if (projectId) {
      // Validate single project belongs to user
      const project = await this.prisma.project.findFirst({
        where: { id: projectId, accountId: user.account.id },
        select: { id: true },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
      userProjectIds = [projectId];
    } else {
      // Get all user's project IDs
      userProjectIds = await this.getUserProjectIds(user.account.id);
    }

    // Default to recent tasks if no date filters specified
    const defaultCreatedFrom =
      !createdFrom && !createdTo && !dueDateFrom && !dueDateTo
        ? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
        : createdFrom;

    // Build optimized where clause
    const where: Prisma.TaskWhereInput = {
      projectId: { in: userProjectIds }, // Direct project filtering
      ...(assigneeId && { assigneeId }),
      ...(creatorId && { creatorId }),
      ...(teamId && { teamId }),
      ...(parentId && { parentId }),
      ...(status && {
        TaskStatus: {
          code: status,
        },
      }),
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
        TaskStatus: {
          code: { not: 'done' },
        },
      }),
      // Only search when query is meaningful (3+ characters)
      ...(search &&
        search.length >= 3 && {
          OR: [
            { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              taskKey: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
            // Only search description if search is longer
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
        }),
      // Default date filtering for performance
      ...(defaultCreatedFrom && { createdAt: { gte: defaultCreatedFrom } }),
    };

    // Build order by clause with safety check
    const validSortBy = sortBy || 'createdAt';
    const validSortOrder = sortOrder || 'desc';
    const orderBy: Prisma.TaskOrderByWithRelationInput = {
      [validSortBy]: validSortOrder,
    };

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        orderBy,
        skip,
        take: cappedLimit,
        include: {
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
            select: {
              children: true,
              comments: true,
              attachments: true,
            },
          },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    const queryDuration = Date.now() - startTime;

    // Log slow queries for monitoring
    if (queryDuration > 1000) {
      this.logger.warn(`Slow task query detected: ${queryDuration}ms`, {
        filters: JSON.stringify(filters),
        resultCount: tasks.length,
        userId: user.userId,
      });
    } else if (queryDuration > 500) {
      this.logger.log(`Task query took ${queryDuration}ms`, {
        resultCount: tasks.length,
        hasSearch: !!search,
        hasComplexFilters: !!(status || priority || type || assigneeId),
      });
    }

    return {
      tasks,
      total,
      page: validPage,
      limit: cappedLimit,
      totalPages: Math.ceil(total / cappedLimit),
    };
  }

  async findOne(id: string, user: UserPayload): Promise<Task> {
    return await this.prisma.task.findUniqueOrThrow({
      where: {
        id,
        project: {
          accountId: user.account.id,
        },
      },
      include: {
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
          orderBy: { createdAt: 'desc' },
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
      },
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
