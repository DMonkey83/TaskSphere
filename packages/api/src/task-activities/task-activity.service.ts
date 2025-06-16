import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TaskActivity } from '@prisma/client';

import { CreateTaskActivityDto } from './dto/task-activities.dto';
import { UserPayload } from '../auth/dto/auth.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaskActivityService {
  private readonly logger = new Logger(TaskActivityService.name);

  constructor(private prisma: PrismaService) {}

  async logActivity(
    dto: CreateTaskActivityDto,
    user: UserPayload,
  ): Promise<TaskActivity> {
    this.logger.log(
      `Logging activity for task: ${dto.taskId} by user: ${user.userId}`,
    );

    // Validate task exists and user has access to it
    const task = await this.prisma.task.findFirst({
      where: {
        id: dto.taskId,
        project: { accountId: user.account.id },
      },
      select: { id: true, projectId: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found or access denied');
    }

    return this.prisma.taskActivity.create({
      data: {
        task: { connect: { id: dto.taskId } },
        user: { connect: { id: user.userId } },
        field: dto.field,
        newValue: dto.newValue ?? null,
        oldValue: dto.oldValue ?? null,
        action: dto.action ?? 'created',
      },
    });
  }

  async listRecentActivitiesByTeam(
    teamId: string,
    user: UserPayload,
    skip: number = 0,
    take: number = 10,
  ): Promise<TaskActivity[]> {
    this.logger.log(`Fetching team activities for team: ${teamId}`);

    // Cap limit for performance
    const cappedTake = Math.min(take, 50);

    // Validate team exists and user has access
    const team = await this.prisma.team.findFirst({
      where: {
        id: teamId,
        account: { id: user.account.id },
      },
      include: {
        members: {
          select: { usersId: true },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found or access denied');
    }

    // Check if user is team member or has admin/PM role
    const isMember = team.members.some(
      (member) => member.usersId === user.userId,
    );
    const isAdminOrPM = ['admin', 'project_manager', 'owner'].includes(
      user.role,
    );

    if (!isMember && !isAdminOrPM) {
      throw new UnauthorizedException('User is not a member of the team');
    }

    return (await this.prisma.taskActivity.findMany({
      where: {
        task: {
          teamId: teamId,
          project: { accountId: user.account.id },
        },
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            taskKey: true,
            project: { select: { name: true, projectKey: true } },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: cappedTake,
    })) as TaskActivity[];
  }

  async listActivitiesByTask(
    taskId: string,
    user: UserPayload,
    skip: number = 0,
    take: number = 10,
  ): Promise<TaskActivity[]> {
    this.logger.log(`Fetching task activities for task: ${taskId}`);

    // Cap limit for performance
    const cappedTake = Math.min(take, 50);

    // Validate task exists and user has access
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        project: { accountId: user.account.id },
      },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found or access denied');
    }

    return (await this.prisma.taskActivity.findMany({
      where: {
        taskId: taskId,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            taskKey: true,
            project: { select: { name: true, projectKey: true } },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: cappedTake,
    })) as TaskActivity[];
  }

  // ===================== NEW DASHBOARD ENDPOINTS =====================

  async listAccountActivities(
    user: UserPayload,
    skip: number = 0,
    take: number = 20,
  ): Promise<TaskActivity[]> {
    this.logger.log(
      `Fetching account-wide activities for account: ${user.account.id}`,
    );

    // Cap limit for performance
    const cappedTake = Math.min(take, 50);

    return (await this.prisma.taskActivity.findMany({
      where: {
        task: {
          project: { accountId: user.account.id },
        },
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            taskKey: true,
            project: { select: { name: true, projectKey: true } },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: cappedTake,
    })) as TaskActivity[];
  }

  async listUserActivities(
    user: UserPayload,
    skip: number = 0,
    take: number = 20,
  ): Promise<TaskActivity[]> {
    this.logger.log(`Fetching user activities for user: ${user.userId}`);

    // Cap limit for performance
    const cappedTake = Math.min(take, 50);

    return (await this.prisma.taskActivity.findMany({
      where: {
        userId: user.userId,
        task: {
          project: { accountId: user.account.id },
        },
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            taskKey: true,
            project: { select: { name: true, projectKey: true } },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: cappedTake,
    })) as TaskActivity[];
  }

  async listProjectActivities(
    projectId: string,
    user: UserPayload,
    skip: number = 0,
    take: number = 20,
  ): Promise<TaskActivity[]> {
    this.logger.log(`Fetching project activities for project: ${projectId}`);

    // Cap limit for performance
    const cappedTake = Math.min(take, 50);

    // Validate project exists and user has access
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        accountId: user.account.id,
      },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found or access denied');
    }

    return (await this.prisma.taskActivity.findMany({
      where: {
        task: {
          projectId: projectId,
        },
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            taskKey: true,
            project: { select: { name: true, projectKey: true } },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: cappedTake,
    })) as TaskActivity[];
  }

  async getActivityStats(user: UserPayload): Promise<{
    totalActivities: number;
    userActivities: number;
    recentActivityCount: number;
    topActions: Array<{ action: string; count: number }>;
  }> {
    this.logger.log(`Fetching activity stats for account: ${user.account.id}`);

    const today = new Date();
    const last24Hours = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const [totalActivities, userActivities, recentActivityCount, actionCounts] =
      await Promise.all([
        // Total activities in account
        this.prisma.taskActivity.count({
          where: {
            task: { project: { accountId: user.account.id } },
          },
        }),
        // User's activities
        this.prisma.taskActivity.count({
          where: {
            userId: user.userId,
            task: { project: { accountId: user.account.id } },
          },
        }),
        // Activities in last 24 hours
        this.prisma.taskActivity.count({
          where: {
            task: { project: { accountId: user.account.id } },
            createdAt: { gte: last24Hours },
          },
        }),
        // Top actions
        this.prisma.taskActivity.groupBy({
          by: ['action'],
          where: {
            task: { project: { accountId: user.account.id } },
          },
          _count: { action: true },
          orderBy: { _count: { action: 'desc' } },
          take: 5,
        }),
      ]);

    const topActions = actionCounts.map((item) => ({
      action: item.action,
      count: item._count.action,
    }));

    return {
      totalActivities,
      userActivities,
      recentActivityCount,
      topActions,
    };
  }
}
