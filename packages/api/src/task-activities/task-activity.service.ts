import { Injectable } from '@nestjs/common';
import { CreateTaskActivityDto } from './dto/task-activities.dto';
import { TaskActivity } from './entities/task-activities.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';

@Injectable()
export class TaskActivityService {
  constructor(
    @InjectRepository(TaskActivity)
    private taskActivityRepository: Repository<TaskActivity>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async logActivity(dto: CreateTaskActivityDto): Promise<TaskActivity> {
    const task = await this.taskRepository.findOneOrFail({
      where: { id: dto.taskId },
    });
    const taskActivity = this.taskActivityRepository.create({
      field: dto.field,
      newValue: dto.field ? dto.field : null,
      oldValue: dto.oldValue ? dto.oldValue : null,
      task,
      user: { id: dto.userId },
      action: (dto.action as string) || 'created',
    });

    return this.taskActivityRepository.save(taskActivity);
  }
}
