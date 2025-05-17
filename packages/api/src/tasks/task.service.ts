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

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(TaskStatusLog)
    private taskStatusLogsRepository: Repository<TaskStatusLog>,
    @InjectRepository(TaskRelation)
    private taskRelationsRepository: Repository<TaskRelation>,
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

  async create(dto: CreateTaskDto): Promise<Task> {
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
      project: { id: project.id },
      title: dto.title,
      description: dto.description,
      asignee: dto.asigneeId ? { id: dto.asigneeId } : null,
      creator: { id: dto.creatorId },
      parent: dto.parentId ? { id: dto.parentId } : null,
      type: dto.type ? dto.type : null,
    });
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

  async update(taskId: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
    });
    if (!task) throw new NotFoundException('Task not found');
    Object.assign(task, {
      id: taskId,
      title: dto.title ?? task.title,
      description: dto.description ?? task.description,
      status: dto.status ?? task.status,
      asignee: dto.asigneeId ? { id: dto.asigneeId } : null,
      dueDate: dto.dueDate ?? task.dueDate,
      deliveryAddress: dto.deliveryAddress ?? task.deliveryAddress,
      deliveryWindow: dto.deliveryWindow ?? task.deliveryWindow,
      billableHours: dto.billableHours ?? task.billableHours,
      storyPoints: dto.storyPoints ?? task.storyPoints,
      updatedAt: new Date().toISOString(),
      priority: dto.priority ?? task.priority,
    });

    return this.tasksRepository.save(task);
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
