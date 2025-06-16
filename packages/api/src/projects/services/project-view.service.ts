import { Injectable, Logger } from '@nestjs/common';
import { Prisma, ProjectView } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectViewDto } from '../dto/project.dto';

@Injectable()
export class ProjectViewService {
  private readonly logger = new Logger(ProjectViewService.name);

  constructor(private readonly prisma: PrismaService) {}

  async addView(
    projectId: string,
    dto: CreateProjectViewDto,
  ): Promise<ProjectView> {
    this.logger.log(`Adding view for project ID: ${projectId}`);

    const view = await this.prisma.projectView.create({
      data: {
        projectId,
        viewType: dto.viewType,
        configuration: dto.configuration || Prisma.JsonNull,
      },
    });

    this.logger.log(`View added successfully for project ID: ${projectId}`);
    return view;
  }

  async getProjectViews(projectId: string): Promise<ProjectView[]> {
    return this.prisma.projectView.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateView(
    viewId: string,
    dto: Partial<CreateProjectViewDto>,
  ): Promise<ProjectView> {
    return this.prisma.projectView.update({
      where: { id: viewId },
      data: {
        ...(dto.viewType && { viewType: dto.viewType }),
        ...(dto.configuration !== undefined && {
          configuration: dto.configuration || Prisma.JsonNull,
        }),
      },
    });
  }

  async deleteView(viewId: string): Promise<void> {
    await this.prisma.projectView.delete({
      where: { id: viewId },
    });
    this.logger.log(`View deleted successfully: ${viewId}`);
  }
}
