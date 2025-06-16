import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectStatsService {
  private readonly logger = new Logger(ProjectStatsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getProjectStats(accountId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byIndustry: Record<string, number>;
  }> {
    const where: Prisma.ProjectWhereInput = {
      accountId,
      archived: false,
    };

    const [total, statusGroups, industryGroups] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.project.groupBy({
        by: ['industry'],
        where,
        _count: true,
      }),
    ]);

    const byStatus = Object.fromEntries(
      statusGroups.map(({ status, _count }) => [status, _count]),
    );
    const byIndustry = Object.fromEntries(
      industryGroups.map(({ industry, _count }) => [industry, _count]),
    );

    return {
      total,
      byStatus,
      byIndustry,
    };
  }

  async getProjectHealth(accountId: string): Promise<{
    totalProjects: number;
    activeProjects: number;
    overdueProjects: number;
    completedThisMonth: number;
    averageTasksPerProject: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const where: Prisma.ProjectWhereInput = {
      accountId,
      archived: false,
    };

    const [
      totalProjects,
      activeProjects,
      overdueProjects,
      completedThisMonth,
      projectsWithTaskCounts,
    ] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.count({
        where: { ...where, status: 'in_progress' },
      }),
      this.prisma.project.count({
        where: {
          ...where,
          endDate: { lt: now },
          status: { not: 'completed' },
        },
      }),
      this.prisma.project.count({
        where: {
          ...where,
          status: 'completed',
          updatedAt: { gte: startOfMonth },
        },
      }),
      this.prisma.project.findMany({
        where,
        select: {
          _count: {
            select: { tasks: true },
          },
        },
      }),
    ]);

    const totalTasks = projectsWithTaskCounts.reduce(
      (sum, project) => sum + project._count.tasks,
      0,
    );
    const averageTasksPerProject =
      totalProjects > 0 ? Math.round(totalTasks / totalProjects) : 0;

    return {
      totalProjects,
      activeProjects,
      overdueProjects,
      completedThisMonth,
      averageTasksPerProject,
    };
  }

  async getProjectTimeline(
    accountId: string,
    days = 30,
  ): Promise<Array<{ date: string; created: number; completed: number }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const projects = await this.prisma.project.findMany({
      where: {
        accountId,
        OR: [
          { createdAt: { gte: startDate } },
          {
            updatedAt: { gte: startDate },
            status: 'completed',
          },
        ],
      },
      select: {
        createdAt: true,
        updatedAt: true,
        status: true,
      },
    });

    const timeline: Record<string, { created: number; completed: number }> = {};

    // Initialize all dates
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      timeline[dateStr] = { created: 0, completed: 0 };
    }

    // Count projects
    projects.forEach((project) => {
      const createdDate = project.createdAt.toISOString().split('T')[0];
      if (timeline[createdDate]) {
        timeline[createdDate].created++;
      }

      if (project.status === 'completed') {
        const completedDate = project.updatedAt.toISOString().split('T')[0];
        if (timeline[completedDate]) {
          timeline[completedDate].completed++;
        }
      }
    });

    return Object.entries(timeline)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
