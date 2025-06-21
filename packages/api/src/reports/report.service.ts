import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Report, Prisma, ReportTypeEnum } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto, UpdateReportDto } from './dto/report.dto';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReportDto): Promise<Report> {
    this.logger.log(
      `Creating report: ${dto.name} for account: ${dto.accountId}`,
    );

    try {
      const report = await this.prisma.report.create({
        data: {
          name: dto.name,
          description: dto.description,
          type: dto.type,
          config: dto.config,
          isPublic: dto.isPublic,
          accountId: dto.accountId,
          createdById: dto.createdById,
        },
        include: {
          account: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      this.logger.log(`Report created successfully: ${report.id}`);
      return report;
    } catch (error) {
      this.handlePrismaError(error, 'create report');
    }
  }

  async findById(id: string, accountId?: string): Promise<Report> {
    if (!id) {
      throw new BadRequestException('Report ID is required');
    }

    try {
      const report = await this.prisma.report.findUnique({
        where: { id },
        include: {
          account: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!report) {
        throw new NotFoundException('Report not found');
      }

      // Validate account access if accountId provided
      if (accountId && report.accountId !== accountId) {
        throw new NotFoundException('Report not found');
      }

      return report;
    } catch (error) {
      this.handlePrismaError(error, 'find report by ID');
    }
  }

  async findByAccount(
    accountId: string,
    isPublic?: boolean,
    type?: string,
    limit = 20,
    offset = 0,
  ): Promise<{
    reports: Report[];
    total: number;
    limit: number;
    offset: number;
  }> {
    if (!accountId) {
      throw new BadRequestException('Account ID is required');
    }

    try {
      const where: Prisma.ReportWhereInput = {
        accountId,
        ...(isPublic !== undefined && { isPublic }),
        ...(type && { type: type as ReportTypeEnum }),
      };

      const [reports, total] = await Promise.all([
        this.prisma.report.findMany({
          where,
          include: {
            account: {
              select: {
                id: true,
                name: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.report.count({ where }),
      ]);

      return { reports, total, limit, offset };
    } catch (error) {
      this.handlePrismaError(error, 'find reports by account');
    }
  }

  async findByUser(
    userId: string,
    accountId: string,
    limit = 20,
    offset = 0,
  ): Promise<{
    reports: Report[];
    total: number;
    limit: number;
    offset: number;
  }> {
    if (!userId || !accountId) {
      throw new BadRequestException('User ID and Account ID are required');
    }

    try {
      const where: Prisma.ReportWhereInput = {
        accountId,
        createdById: userId,
      };

      const [reports, total] = await Promise.all([
        this.prisma.report.findMany({
          where,
          include: {
            account: {
              select: {
                id: true,
                name: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.report.count({ where }),
      ]);

      return { reports, total, limit, offset };
    } catch (error) {
      this.handlePrismaError(error, 'find reports by user');
    }
  }

  async update(
    id: string,
    dto: UpdateReportDto,
    accountId?: string,
  ): Promise<Report> {
    try {
      const updateData: Prisma.ReportUpdateInput = {
        ...dto,
        updatedAt: new Date(),
      };

      const updatedReport = await this.prisma.report.update({
        where: {
          id,
          ...(accountId && { accountId }),
        },
        data: updateData,
        include: {
          account: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      this.logger.log(`Report updated successfully: ${id}`);
      return updatedReport;
    } catch (error) {
      this.handlePrismaError(error, 'update report');
    }
  }

  async delete(id: string, accountId?: string): Promise<void> {
    try {
      await this.prisma.report.delete({
        where: {
          id,
          ...(accountId && { accountId }),
        },
      });

      this.logger.log(`Report deleted successfully: ${id}`);
    } catch (error) {
      this.handlePrismaError(error, 'delete report');
    }
  }

  async executeReport(id: string, accountId?: string): Promise<any> {
    const report = await this.findById(id, accountId);

    this.logger.log(`Executing report: ${report.name} (${report.type})`);

    try {
      switch (report.type) {
        case 'project_summary':
          return this.generateProjectSummary(report.config, accountId);
        case 'task_performance':
          return this.generateTaskPerformance(report.config, accountId);
        case 'time_tracking':
          return this.generateTimeTracking(report.config, accountId);
        case 'budget_analysis':
          return this.generateBudgetAnalysis(report.config, accountId);
        case 'team_productivity':
          return this.generateTeamProductivity(report.config, accountId);
        case 'milestone_progress':
          return this.generateMilestoneProgress(report.config, accountId);
        case 'sprint_report':
          return this.generateSprintReport(report.config, accountId);
        case 'custom':
          return this.executeCustomReport(report.config, accountId);
        default:
          throw new BadRequestException(
            `Unsupported report type: ${String(report.type)}`,
          );
      }
    } catch (error) {
      this.logger.error(`Failed to execute report ${id}:`, error);
      throw new BadRequestException('Failed to execute report');
    }
  }

  private async generateProjectSummary(
    config: any,
    accountId?: string,
  ): Promise<any> {
    const where: Prisma.ProjectWhereInput = {
      ...(accountId && { accountId }),
      ...(config.projectIds && { id: { in: config.projectIds } }),
      ...(config.status && { status: config.status }),
    };

    const projects = await this.prisma.project.findMany({
      where,
      include: {
        _count: {
          select: {
            tasks: true,
            members: true,
            milestones: true,
          },
        },
      },
    });

    return {
      type: 'project_summary',
      data: projects,
      summary: {
        totalProjects: projects.length,
        totalTasks: projects.reduce(
          (sum, p) =>
            sum + (typeof p._count.tasks === 'number' ? p._count.tasks : 0),
          0,
        ),
        totalMembers: projects.reduce((sum, p) => sum + p._count.members, 0),
        totalMilestones: projects.reduce(
          (sum, p) => sum + p._count.milestones,
          0,
        ),
      },
    };
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */

  // Stub implementations - parameters will be used when features are implemented
  private generateTaskPerformance(
    config: any,
    accountId?: string,
  ): Promise<any> {
    // TODO: Use config for filtering tasks and accountId for security
    return Promise.resolve({
      type: 'task_performance',
      data: [],
      message: 'Task performance report implementation needed',
    });
  }

  private generateTimeTracking(config: any, accountId?: string): Promise<any> {
    // TODO: Use config for date ranges and accountId for filtering
    return Promise.resolve({
      type: 'time_tracking',
      data: [],
      message: 'Time tracking report implementation needed',
    });
  }

  private generateBudgetAnalysis(
    config: any,
    accountId?: string,
  ): Promise<any> {
    // TODO: Use config for project selection and accountId for access control
    return Promise.resolve({
      type: 'budget_analysis',
      data: [],
      message: 'Budget analysis report implementation needed',
    });
  }

  private generateTeamProductivity(
    config: any,
    accountId?: string,
  ): Promise<any> {
    // TODO: Use config for team selection and accountId for data filtering
    return Promise.resolve({
      type: 'team_productivity',
      data: [],
      message: 'Team productivity report implementation needed',
    });
  }

  private generateMilestoneProgress(
    config: any,
    accountId?: string,
  ): Promise<any> {
    // TODO: Use config for milestone filtering and accountId for security
    return Promise.resolve({
      type: 'milestone_progress',
      data: [],
      message: 'Milestone progress report implementation needed',
    });
  }

  private generateSprintReport(config: any, accountId?: string): Promise<any> {
    // TODO: Use config for sprint selection and accountId for access control
    return Promise.resolve({
      type: 'sprint_report',
      data: [],
      message: 'Sprint report implementation needed',
    });
  }

  private executeCustomReport(config: any, accountId?: string): Promise<any> {
    // TODO: Use config for custom query execution and accountId for security
    return Promise.resolve({
      type: 'custom',
      data: [],
      message: 'Custom report execution implementation needed',
    });
  }

  /* eslint-enable @typescript-eslint/no-unused-vars */

  private handlePrismaError(error: unknown, operation: string): never {
    this.logger.error(`Failed to ${operation}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new BadRequestException(
            'A report with this name already exists',
          );
        case 'P2025':
          throw new NotFoundException('Report not found');
        case 'P2003':
          throw new BadRequestException(
            'Invalid reference: related record does not exist',
          );
        default:
          throw new BadRequestException(
            `Database error occurred during ${operation}: ${error.message}`,
          );
      }
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new BadRequestException(
        `Invalid data provided for ${operation}: ${error.message}`,
      );
    }

    throw new BadRequestException(
      `Failed to ${operation}, please try again later`,
    );
  }
}
