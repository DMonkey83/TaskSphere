import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskStatusLog } from './entities/task-status-log';
import { ProjectsService } from '../projects/projects.service';
import {
  CreateTaskDto,
  LogTaskStatusDto,
  TaskDto,
  UpdateLogTaskStatusDto,
  UpdateTaskDto,
} from './dto/task.dto';
import { Task } from './entities/task.entity';
import { TaskRelation } from './entities/task-relation';
import { TaskActivityService } from '../task-activities/task-activity.service';
import { User } from '../users/entities/user.entity';
import { Team } from '../teams/entities/team.entity';
import { Project } from '../projects/entities/project.entity';
import { Relations } from '../common/enums/relations.enum';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(TaskStatusLog)
    private taskStatusLogsRepository: Repository<TaskStatusLog>,
    @InjectRepository(TaskRelation)
    private taskRelationsRepository: Repository<TaskRelation>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    private projectService: ProjectsService,
    private taskActivityService: TaskActivityService,
  ) {}

  private async generateTaskKey(projectKey: string): Promise<string> {
    const projectTasks = await this.tasksRepository.find({
      where: { project: { projectKey: projectKey } },
      select: ['id'],
    });
    const taskCount = projectTasks.length;
    return `${projectKey}-${taskCount}`;
  }

  async createTask(dto: CreateTaskDto, user: User): Promise<Task> {
    await this.validateTaskType(
      dto.type as string,
      dto.parentId as string,
      null,
    );
    const task = this.tasksRepository.create(dto as Task);
    task.creator = user;
    await this.assignTaskEntities(task, dto);
    await this.tasksRepository.save(task);
    await this.taskActivityService.logActivity({
      taskId: task.id,
      userId: user.id,
      action: 'created',
    });
    if (dto.relatedTasks) {
      await this.createRelations(
        task,
        dto.relatedTasks as { taskId: string; relationType: Relations }[],
      );
    }
    return task;
  }

  private async createRelations(
    task: Task,
    relations: { taskId: string; relationType: string }[],
  ) {
    for (const rel of relations) {
      const relation = this.taskRelationsRepository.create({
        task,
        relatedTask: await this.tasksRepository.findOneOrFail({
          where: { id: rel.taskId },
        }),
        relationType: rel.relationType,
      });
      await this.taskRelationsRepository.save(relation);
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
      const parent = await this.tasksRepository.findOneOrFail({
        where: { id: parentId },
      });
      if (parent.type === 'subtask') {
        throw new BadRequestException('Subtasks cannot be parents');
      }
    }
  }

  private async assignTaskEntities(
    task: Task,
    dto: Partial<TaskDto>,
  ): Promise<void> {
    if (dto.projectId) {
      task.project = await this.projectRepository.findOneOrFail({
        where: { id: dto.projectId as string },
      });
    }
    task.assignee = dto.assigneeId
      ? await this.userRepository.findOneOrFail({
          where: { id: dto.assigneeId as string },
        })
      : null;
    task.team = dto.teamId
      ? await this.teamRepository.findOneOrFail({
          where: { id: dto.teamId as string },
        })
      : null;
    task.parent = dto.parentId
      ? await this.tasksRepository.findOneOrFail({
          where: { id: dto.parentId as string },
        })
      : null;
  }

  private async updateTaskFields(
    task: Task,
    dto: Partial<TaskDto>,
  ): Promise<void> {
    const simpleFields: (keyof TaskDto)[] = [
      'title',
      'description',
      'status',
      'priority',
      'type',
      'storyPoints',
    ];
    simpleFields.forEach((field) => {
      if (dto[field] !== undefined) {
        task[field] = dto[field] as string | number;
      }
    });
    if (dto.dueDate !== undefined) {
      task.dueDate = dto.dueDate ? new Date(dto.dueDate as Date) : null;
    }
    if (dto.projectId !== task.project?.id) {
      task.project = await this.projectRepository.findOneOrFail({
        where: { id: dto.projectId as string },
      });
    }
    await this.assignTaskEntities(task, dto);
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
      { key: 'title', getOldValue: (t) => t.title },
      { key: 'storyPoints', getOldValue: (t) => t.storyPoints },
      { key: 'description', getOldValue: (t) => t.description },
      { key: 'status', getOldValue: (t) => t.status },
      { key: 'priority', getOldValue: (t) => t.priority },
      { key: 'type', getOldValue: (t) => t.type },
      { key: 'assigneeId', getOldValue: (t) => t.assignee?.id },
      { key: 'teamId', getOldValue: (t) => t.team?.id },
      { key: 'parentId', getOldValue: (t) => t.parent?.id },
      { key: 'dueDate', getOldValue: (t) => t.dueDate?.toISOString() },
      {
        key: 'relatedTasks',
        getOldValue: (t) =>
          t.relatedTasks
            .map((rt) => rt.id)
            .sort()
            .join(',') || '',
      },
    ];

    for (const { key, getOldValue } of fieldsToTrack) {
      if (dto[key] === undefined) continue;
      const oldValue = getOldValue(task);
      let newValue = dto[key] as string | number | Date | null;

      if (key === 'relatedTasks') {
        newValue =
          (dto.relatedTasks as Task[])
            .map((rt) => rt.id)
            .sort()
            .join(',') || '';
      } else if (key === 'dueDate') {
        newValue = (dto.dueDate as Date) || '';
      }

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
  }

  async getTaskWithHierarchy(id: string): Promise<Task> {
    return this.tasksRepository.findOneOrFail({
      where: { id },
      relations: [
        'parent',
        'children',
        'children.children',
        'relatedTasks',
        'creator',
        'assignee',
      ],
    });
  }

  async update(taskId: string, dto: UpdateTaskDto, user: User): Promise<Task> {
    const task = await this.tasksRepository.findOneOrFail({
      where: { id: taskId },
      relations: ['assignee', 'team', 'parent', 'relatedTasks', 'project'],
    });

    if (dto.type || dto.parentId !== undefined) {
      await this.validateTaskType(
        (dto.type as string) || task.type,
        (dto.parentId as string) ?? task.parent?.id,
        task.parent?.id,
      );
    }
    await this.logTaskChanges(task, dto, user);
    await this.updateTaskFields(task, dto);
    if (dto.relatedTasks) {
      await this.taskRelationsRepository.delete({ id: task.id });
      await this.createRelations(
        task,
        dto.relatedTasks as { taskId: string; relationType: string }[],
      );
    }
    return task;
  }

  async logStatus(
    taskId: string,
    dto: LogTaskStatusDto,
  ): Promise<TaskStatusLog> {
    const task = await this.tasksRepository.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    const log = this.taskStatusLogsRepository.create({
      task: { id: taskId },
      status: dto.status as string,
      location: dto.location as string,
      updatedBy: dto.updatedById ? { id: dto.updatedById as string } : null,
    });
    return this.taskStatusLogsRepository.save(log);
  }

  async updateLogStatus(
    logStatusId: string,
    dto: UpdateLogTaskStatusDto,
  ): Promise<TaskStatusLog> {
    const statusLog = await this.taskStatusLogsRepository.findOne({
      where: { id: logStatusId },
    });
    if (!statusLog) throw new NotFoundException('Status Log not found');
    Object.assign(statusLog, {
      status: (dto.status as string) ?? statusLog.status,
      location: (dto.location as string) ?? statusLog.location,
      updatedBy: { id: (dto.updatedById as string) ?? statusLog.updatedBy.id },
    });

    return this.taskStatusLogsRepository.save(statusLog);
  }
}
