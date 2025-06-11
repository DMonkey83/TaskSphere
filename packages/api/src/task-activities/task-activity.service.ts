import { Injectable } from '@nestjs/common';
import { CreateTaskActivityDto } from './dto/task-activities.dto';
import { TaskActivity } from './entities/task-activities.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { Team } from '../teams/entities/team.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TaskActivityService {
  constructor(
    @InjectRepository(TaskActivity)
    private taskActivityRepository: Repository<TaskActivity>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
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
      action: dto.action || 'created',
    });

    return this.taskActivityRepository.save(taskActivity);
  }

  async listRecentActivitiesByTeam(
    teamId: string,
    accountId: string,
    user: User,
    skip: number = 0,
    take: number = 10,
  ): Promise<TaskActivity[]> {
    if (user.account.id !== accountId) {
      throw new Error('Unauthorized access to team activities');
    }

    const team = await this.teamRepository.findOneOrFail({
      where: { id: teamId, account: { id: accountId } },
      relations: ['members'],
    });

    const isMember = team.members.some((member) => member.id === user.id);
    const isAdminOrPM = ['admin', 'project_manager'].includes(user.role);
    if (!isMember && !isAdminOrPM) {
      throw new Error('User is not a member of the team');
    }

    return this.taskActivityRepository.find({
      where: {
        task: { team: { id: teamId }, project: { account: { id: accountId } } },
      },
      relations: ['task', 'user'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  async listActivitiesByTask(
    taskId: string,
    accountId: string,
    user: User,
    skip: number = 0,
    take: number = 10,
  ): Promise<TaskActivity[]> {
    if (user.account.id !== accountId) {
      throw new Error('Unauthorized access to team activities');
    }

    const task = await this.taskRepository.findOneOrFail({
      where: { id: taskId },
      relations: ['project', 'project.account'],
    });

    return this.taskActivityRepository.find({
      where: {
        task: { taskKey: task.id, project: { account: { id: accountId } } },
      },
      relations: ['task', 'user'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }
}
