import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  MemberRoleEnum,
  Prisma,
  Project,
  ProjectIndustryEnum,
  ProjectStatusEnum,
  ProjectView,
  ProjectVisibilityEnum,
  ProjectWorkflowEnum,
} from '@prisma/client';

import { slugify } from '../common/slugify.util';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProjectDto,
  CreateProjectViewDto,
  UpdateProjectDto,
  UpdateProjectStatusDto,
} from './dto/project.dto';
import { ProjectKeyService } from './services/project-key.service';
import { ProjectSearchService } from './services/project-search.service';
import { ProjectStatsService } from './services/project-stats.service';
import { ProjectViewService } from './services/project-view.service';
import { SearchProjectsParams } from './types/project.types';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly projectKeyService: ProjectKeyService,
    private readonly projectSearchService: ProjectSearchService,
    private readonly projectViewService: ProjectViewService,
    private readonly projectStatsService: ProjectStatsService,
  ) {}

  // ===================== CORE CRUD OPERATIONS =====================

  async create(dto: CreateProjectDto): Promise<Project> {
    this.logger.log(
      `Creating project: ${dto.name} for account: ${dto.accountId}`,
    );
    try {
      const projectKey = await this.projectKeyService.generateProjectKey(
        dto.name,
        dto.industry,
        dto.accountId,
      );
      const slug = slugify(dto.name);

      const savedProject = await this.prisma.project.create({
        data: {
          projectKey,
          name: dto.name,
          description: dto.description || '',
          ownerId: dto.ownerId,
          accountId: dto.accountId,
          industry:
            (dto.industry as ProjectIndustryEnum) || ProjectIndustryEnum.other,
          workflow:
            (dto.workflow as ProjectWorkflowEnum) || ProjectWorkflowEnum.kanban,
          matterNumber: dto.matterNumber || '',
          slug,
          visibility:
            (dto.visibility as ProjectVisibilityEnum) ||
            ProjectVisibilityEnum.private,
          tags: dto.tags || [],
          startDate: dto.startDate ? new Date(dto.startDate) : null,
          endDate: dto.endDate ? new Date(dto.endDate) : null,
          config: dto.config || {},
          status: ProjectStatusEnum.planned,
          members: {
            create: {
              userId: dto.ownerId,
              role: MemberRoleEnum.owner,
            },
          },
        },
        include: {
          owner: true,
          account: true,
        },
      });

      this.logger.log(`Project created successfully: ${savedProject.id}`);
      return savedProject;
    } catch (error) {
      this.handlePrismaError(error, 'create project');
    }
  }

  async findProjectById(id: string, accountId?: string): Promise<Project> {
    if (!id) {
      throw new BadRequestException('Project ID is required');
    }
    try {
      const project = await this.prisma.project.findUnique({
        where: { id },
        include: {
          owner: true,
          account: true,
          _count: {
            select: {
              tasks: true,
              members: true,
            },
          },
        },
      });

      // Validate account access if accountId provided
      if (accountId && project && project.accountId !== accountId) {
        throw new NotFoundException('Project not found');
      }

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      return project;
    } catch (error) {
      this.handlePrismaError(error, 'find project by ID');
    }
  }

  async findByKey(projectKey: string, accountId?: string): Promise<Project> {
    if (!projectKey) {
      throw new BadRequestException('Project key is required');
    }

    const where: Prisma.ProjectWhereInput = {
      projectKey,
      ...(accountId && { accountId }),
    };

    const project = await this.prisma.project.findFirst({
      where,
      include: {
        owner: true,
        account: true,
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
    });

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async updateProject(
    projectId: string,
    dto: UpdateProjectDto,
    accountId?: string,
  ): Promise<Project> {
    try {
      const updateData: Prisma.ProjectUpdateInput = {
        ...dto,
        industry: dto.industry as ProjectIndustryEnum,
        workflow: dto.workflow as ProjectWorkflowEnum,
        visibility: dto.visibility as ProjectVisibilityEnum,
        updatedAt: new Date(),
      };

      if (dto.name) {
        const existingProject = await this.prisma.project.findUnique({
          where: { id: projectId },
          select: { name: true, slug: true, accountId: true },
        });

        // Validate account access
        if (
          accountId &&
          existingProject &&
          existingProject.accountId !== accountId
        ) {
          throw new NotFoundException('Project not found');
        }
        if (existingProject && existingProject.name !== dto.name) {
          updateData.slug = slugify(dto.name);
        }
      }
      if (dto.startDate) {
        updateData.startDate = new Date(dto.startDate);
      }
      if (dto.endDate) {
        updateData.endDate = new Date(dto.endDate);
      }
      const updatedProject = await this.prisma.project.update({
        where: {
          id: projectId,
          ...(accountId && { accountId }),
        },
        data: {
          ...updateData,
        },
        include: {
          owner: true,
          account: true,
          _count: {
            select: {
              tasks: true,
              members: true,
            },
          },
        },
      });
      this.logger.log(`Project updated successfully: ${projectId}`);
      return updatedProject;
    } catch (error) {
      this.handlePrismaError(error, 'update project');
    }
  }

  async changeProjectStatus(
    projectId: string,
    dto: UpdateProjectStatusDto,
    accountId?: string,
  ): Promise<Project> {
    if (!dto.status) {
      throw new BadRequestException('Status is required');
    }

    this.logger.log(
      `Changing status for project ID: ${projectId} to ${dto.status}`,
    );

    try {
      const updatedProject = await this.prisma.project.update({
        where: {
          id: projectId,
          ...(accountId && { accountId }),
        },
        data: {
          status: dto.status as ProjectStatusEnum,
          updatedAt: new Date(),
        },
        include: {
          owner: true,
          account: true,
          _count: {
            select: {
              tasks: true,
              members: true,
            },
          },
        },
      });
      this.logger.log(
        `Project status updated successfully: ${projectId} to ${dto.status}`,
      );
      return updatedProject;
    } catch (error) {
      this.handlePrismaError(error, 'change project status');
    }
  }

  async archiveProject(
    projectId: string,
    accountId?: string,
  ): Promise<Project> {
    try {
      const archivedProject = await this.prisma.project.update({
        where: {
          id: projectId,
          ...(accountId && { accountId }),
        },
        data: {
          archived: true,
          updatedAt: new Date(),
        },
        include: {
          owner: true,
          account: true,
          _count: {
            select: {
              tasks: true,
              members: true,
            },
          },
        },
      });

      this.logger.log(`Project archived successfully: ${projectId}`);

      return archivedProject;
    } catch (error) {
      this.handlePrismaError(error, 'archive project');
    }
  }

  // ===================== LISTING & SEARCH OPERATIONS =====================

  async listProjectsByAccount(accountId: string): Promise<Project[]> {
    if (!accountId) {
      throw new BadRequestException('Account ID is required');
    }

    this.logger.log(`Listing projects for account ID: ${accountId}`);

    const result = await this.prisma.project.findMany({
      where: {
        accountId,
        archived: false,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        account: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    this.logger.log(`Found ${result.length} projects for account ${accountId}`);
    return result as Project[];
  }

  // Delegate search operations to ProjectSearchService
  async searchProjects(params: SearchProjectsParams): Promise<{
    projects: Project[];
    total: number;
    limit: number;
    offset: number;
  }> {
    return this.projectSearchService.searchProjects(params);
  }

  async listProjectsPaginated(
    accountId: string,
    limit: number,
    offset: number,
  ): Promise<{
    projects: Project[];
    total: number;
    limit: number;
    offset: number;
  }> {
    return this.projectSearchService.listProjectsPaginated(
      accountId,
      limit,
      offset,
    );
  }

  async searchProjectsByName(
    accountId: string,
    name: string,
    limit = 10,
  ): Promise<Project[]> {
    return this.projectSearchService.searchProjectsByName(
      accountId,
      name,
      limit,
    );
  }

  async getProjectSuggestions(
    accountId: string,
    query: string,
    limit = 5,
  ): Promise<Array<{ id: string; name: string; projectKey: string }>> {
    return this.projectSearchService.getProjectSuggestions(
      accountId,
      query,
      limit,
    );
  }

  // ===================== VIEW OPERATIONS =====================

  async addView(
    projectId: string,
    dto: CreateProjectViewDto,
    accountId?: string,
  ): Promise<ProjectView> {
    this.logger.log(`Adding view for project ID: ${projectId}`);

    // Validate project exists and user has access
    await this.findProjectById(projectId, accountId);

    return this.projectViewService.addView(projectId, dto);
  }

  // ===================== STATISTICS OPERATIONS =====================

  async getProjectStats(accountId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byIndustry: Record<string, number>;
  }> {
    return this.projectStatsService.getProjectStats(accountId);
  }

  // ===================== ERROR HANDLING =====================

  private handlePrismaError(error: unknown, operation: string): never {
    this.logger.error(`Failed to ${operation}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new BadRequestException(
            'A project with this key or slug already exists',
          );
        case 'P2025':
          throw new NotFoundException('Project not found');
        case 'P2003':
          throw new BadRequestException(
            'Invalid reference: related record does not exist',
          );
        default:
          throw new BadRequestException(
            `Prisma error occurred during ${operation}: ${error.message}`,
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
