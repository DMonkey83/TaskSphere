import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(TaskStatusLog)
    private taskStatusLogsRepository: Repository<TaskStatusLog>,
    private projectService: ProjectsService,
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
    const task = this.tasksRepository.create({
      taskKey,
      project: { id: project.id },
      title: dto.title,
      description: dto.description,
      asignee: dto.asigneeId ? { id: dto.asigneeId } : null,
    });
    return this.tasksRepository.save(task);
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
