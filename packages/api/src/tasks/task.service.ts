import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTaskDto,
  LogTaskStatusDto,
  TaskDto,
  UpdateLogTaskStatusDto,
  UpdateTaskDto,
} from './dto/task.dto';
import {
  Task,
  User,
  TaskRelationTypeEnum,
  TaskStatusLog,
} from '../../generated/prisma';
import { TaskActivityService } from '../task-activities/task-activity.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  constructor(
    private prisma: PrismaService,
    private taskActivityService: TaskActivityService,
  ) {}

  private async generateTaskKey(projectKey: string): Promise<string> {
    const projectTasks = await this.prisma.task.count({
      where: { project: { projectKey } },
    });
    const taskCount = projectTasks + 1; // Start from 1
    return `${projectKey}-${taskCount}`;
  }

  async createTask(dto: CreateTaskDto, user: User): Promise<Task> {
    await this.validateTaskType(
      dto.type as string,
      dto.parentId as string,
      null,
    );

    const project = await this.prisma.project.findUniqueOrThrow({
      where: { id: dto.projectId },
      include: { tasks: true },
    });

    const taskKey = await this.generateTaskKey(project.projectKey);

    const task = await this.prisma.task.create({
      data: {
        title: dto.title, // Ensure required field is present
        description: dto.description,
        type: dto.type,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate as Date) : undefined,
        project: { connect: { id: project.id } },
        creator: { connect: { id: user.id } },
        assignee: dto.assigneeId
          ? { connect: { id: dto?.assigneeId as string } }
          : undefined,
        team: dto.teamId
          ? { connect: { id: dto?.teamId as string } }
          : undefined,
        parent: dto.parentId
          ? { connect: { id: dto?.parentId as string } }
          : undefined,
        taskKey,
      },
    });
    await this.taskActivityService.logActivity({
      taskId: task.id,
      userId: user.id,
      action: 'created',
    });
    if (dto.relatedTasks?.length) {
      await this.createRelations(
        task,
        dto.relatedTasks as {
          taskId: string;
          relationType: TaskRelationTypeEnum;
        }[],
      );
    }
    return task;
  }

  private async createRelations(
    task: Task,
    relations: { taskId: string; relationType: TaskRelationTypeEnum }[],
  ) {
    for (const rel of relations) {
      const relatedTask = await this.prisma.task.findUnique({
        where: { id: rel.taskId },
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

  private async getRelatedTasks(taskId: string): Promise<Task[]> {
    const relations = await this.prisma.taskRelation.findMany({
      where: {
        OR: [{ taskId }, { relatedTaskId: taskId }],
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

  private async logTaskChanges(
    task: Task,
    dto: Partial<TaskDto>,
    user: User,
  ): Promise<void> {
    const fieldsToTrack: {
      key: keyof TaskDto;
      getOldValue: (task: Task) => string | number | null;
    }[] = [
      { key: 'title', getOldValue: (t) => t.title as string },
      { key: 'storyPoints', getOldValue: (t) => t.storyPoints as number },
      { key: 'description', getOldValue: (t) => t.description as string },
      { key: 'status', getOldValue: (t) => t.statusId as string },
      { key: 'priority', getOldValue: (t) => t.priority as string },
      { key: 'type', getOldValue: (t) => t.type as string },
      { key: 'assigneeId', getOldValue: (t) => t.assigneeId as string },
      { key: 'teamId', getOldValue: (t) => t.teamId as string },
      { key: 'parentId', getOldValue: (t) => t.parentId as string },
      {
        key: 'dueDate',
        getOldValue: (t) =>
          t.dueDate ? (t.dueDate as Date).toISOString() : null,
      },
    ];

    for (const { key, getOldValue } of fieldsToTrack) {
      if (dto[key] === undefined) continue;

      const oldValue = getOldValue(task);
      const newValue = dto[key] as string | number | Date | null;

      if (
        oldValue !== newValue &&
        !(oldValue === null && newValue === undefined)
      ) {
        await this.taskActivityService.logActivity({
          taskId: task.id,
          userId: user.id,
          action: 'updated',
          field: key as string,
          oldValue: oldValue?.toString() ?? '',
          newValue: newValue?.toString() ?? '',
        });
      }
    }

    if (dto.relatedTasks !== undefined) {
      const currentRelatedTasks = await this.getRelatedTasks(task.id);
      const currentIds = currentRelatedTasks
        .map((t) => t.id as string)
        .sort()
        .join(',');
      const newIds = (dto.relatedTasks || [])
        .map((t) => t.taskId as string)
        .sort()
        .join(',');
      if (currentIds !== newIds) {
        await this.taskActivityService.logActivity({
          taskId: task.id,
          userId: user.id,
          action: 'updated',
          field: 'relatedTasks',
          oldValue: JSON.stringify(await this.getRelatedTasks(task.id)),
          newValue: JSON.stringify(dto.relatedTasks || []),
        });
      }
    }
  }

  async getTaskWithHierarchy(id: string): Promise<Task> {
    return await this.prisma.task.findUniqueOrThrow({
      where: { id },
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

  async update(taskId: string, dto: UpdateTaskDto, user: User): Promise<Task> {
    const task = await this.prisma.task.findUniqueOrThrow({
      where: { id: taskId },
      include: {
        assignee: true,
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
      await this.createRelations(task, dto.sourceRelations);
    }
    return updatedTask;
  }

  async logStatus(
    taskId: string,
    dto: LogTaskStatusDto,
  ): Promise<TaskStatusLog> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
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
}
