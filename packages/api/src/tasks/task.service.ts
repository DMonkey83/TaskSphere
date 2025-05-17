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
  UpdateLogTaskStatusDto,
  UpdateTaskDto,
} from './dto/task.dto';
import { Task } from './entities/task.entity';
import { TaskRelation } from './entities/task-relation';
import { TaskActivityService } from '../TaskActivities/task-activity.service';
import { User } from '../users/entities/user.entity';
import { Team } from '../teams/entities/team.entity';
import { Project } from '../projects/entities/project.entity';

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
    const project = await this.projectService.findByKey(dto.projectKey);
    if (!project) throw new NotFoundException('Project not found');
    const taskKey = await this.generateTaskKey(project.projectKey);
    if (dto.type === 'subtask' && !dto.parentId) {
      throw new BadRequestException('Subtasks must have a parent');
    }
    if (dto.type == 'epic' && dto.parentId) {
      throw new BadRequestException('Epics coannot have a parent');
    }
    const task = this.tasksRepository.create({
      taskKey,
      title: dto.title,
      description: dto.description,
      type: dto.type ? dto.type : null,
    });
    task.creator = user;
    task.project = await this.projectRepository.findOneOrFail({
      where: { id: dto.projectId },
    });
    if (dto.assigneeId) {
      task.assignee = await this.userRepository.findOneOrFail({
        where: { id: dto.assigneeId },
      });
    }
    if (dto.teamId) {
      task.team = await this.teamRepository.findOneOrFail({
        where: { id: dto.teamId },
      });
    }
    if (dto.parentId) {
      const parent = await this.tasksRepository.findOneOrFail({
        where: { id: dto.parentId },
      });
      if (parent.type === 'subtask') {
        throw new BadRequestException('Subtasks cannot be parents');
      }
      task.parent = parent;
    }
    await this.tasksRepository.save(task);
    await this.taskActivityService.logActivity({
      taskId: task.id,
      userId: dto.creatorId,
      action: 'created',
    });
    if (dto.relatedTasks) {
      const validRelations = dto.relatedTasks?.filter(
        (rel) => rel.taskId && rel.relationType,
      ) as { taskId: string; relationType: string }[];
      await this.createRelations(task, validRelations);
    }
    return task;
  }

  async createRelations(
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
    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
      relations: ['assignee', 'team', 'parent', 'relatedTasks', 'project'],
    });
    if (!task) throw new NotFoundException('Task not found');

    if (dto.type) {
      if (dto.type === 'subtask' && !dto.parentId && !task.parent) {
        throw new BadRequestException('Subtask must have a parent');
      }
      if (dto.type === 'epic' && (dto.parentId || task.parent)) {
        throw new BadRequestException('Epics cannot have a parent');
      }
    }

    await this.logTaskChanges(task, dto, user);

    if (dto.title) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.status) task.status = dto.status;
    if (dto.priority) task.priority = dto.priority;
    if (dto.type) task.type = dto.type;
    if (dto.storyPoints) task.storyPoints = dto.storyPoints;
    if (dto.dueDate !== undefined)
      task.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;

    if (dto.assigneeId !== undefined) {
      task.assignee = dto.assigneeId
        ? await this.userRepository.findOneOrFail({
            where: { id: dto.assigneeId },
          })
        : null;
    }
    if (dto.teamId !== undefined) {
      task.team = dto.teamId
        ? await this.teamRepository.findOneOrFail({ where: { id: dto.teamId } })
        : null;
    }
    if (dto.parentId !== undefined) {
      task.parent = dto.parentId
        ? await this.tasksRepository.findOneOrFail({
            where: { id: dto.parentId },
          })
        : null;
      if (task.parent && task.parent.type === 'subtask') {
        throw new BadRequestException('Subtasks cannot be parents');
      }
    }

    if (dto.relatedTasks) {
      await this.taskRelationsRepository.delete({ id: task.id });
      const validRelations = dto.relatedTasks?.filter(
        (rel) => rel.taskId && rel.relationType,
      ) as { taskId: string; relationType: string }[];
      await this.createRelations(task, validRelations);
    }

    await this.tasksRepository.save(task);
    return task;
  }

  private async logTaskChanges(
    task: Task,
    dto: Partial<UpdateTaskDto>,
    user: User,
  ): Promise<void> {
    const changes: { field: string; oldValue: string; newValue: string }[] = [];
    const addChange = (field: string, oldValue: any, newValue: any) => {
      if (
        oldValue !== newValue &&
        !(oldValue === null && newValue === undefined)
      ) {
        changes.push({
          field,
          oldValue:
            typeof oldValue !== 'string'
              ? (oldValue as number)?.toString()
              : (oldValue ?? ''),
          newValue:
            typeof newValue !== 'string'
              ? (newValue as number)?.toString()
              : (newValue ?? ''),
        });
      }
    };

    addChange('title', task.title, dto.title);
    addChange('description', task.description, dto.description);
    addChange('status', task.status, dto.status);
    addChange('priority', task.priority, dto.priority);
    addChange('type', task.type, dto.type);
    addChange('assigneeId', task.assignee?.id, dto.assigneeId);
    addChange('teamId', task.team?.id, dto.teamId);
    addChange('parentId', task.parent?.id, dto.parentId);
    addChange('dueDate', task.dueDate?.toISOString(), dto.dueDate);
    addChange('storyPoints', task.storyPoints, dto.storyPoints);

    if (dto.relatedTasks) {
      const oldRelatedTasks =
        task.relatedTasks
          ?.map((rt) => rt.id)
          .sort()
          .join(',') || '';
      const newRelatedTasks =
        dto.relatedTasks
          ?.map((rt) => rt.taskId)
          .sort()
          .join(',') || '';
      addChange('relatedTasks', oldRelatedTasks, newRelatedTasks);
    }

    for (const change of changes) {
      await this.taskActivityService.logActivity({
        taskId: task.id,
        userId: user.id,
        action: 'updated',
        field: change.field,
        newValue: change.newValue,
        oldValue: change.oldValue,
      });
    }
  }

  async logStatus(
    taskId: string,
    dto: LogTaskStatusDto,
  ): Promise<TaskStatusLog> {
    const task = await this.tasksRepository.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    const log = this.taskStatusLogsRepository.create({
      task: { id: taskId },
      status: dto.status,
      location: dto.location,
      updatedBy: dto.updatedById ? { id: dto.updatedById } : null,
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
      status: dto.status ?? statusLog.status,
      location: dto.location ?? statusLog.location,
      updatedBy: { id: dto.updatedById ?? statusLog.updatedBy.id },
    });

    return this.taskStatusLogsRepository.save(statusLog);
  }
}
