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
} from '../../generated/prisma';
import { slugify } from '../common/slugify.util';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProjectDto,
  CreateProjectViewDto,
  UpdateProjectDto,
  UpdateProjectStatusDto,
} from './dto/project.dto';
import { SearchProjectsParams } from './types/project.types';

const PROJECT_KEY_GENERATION_LIMIT = 99; // Limit for unique key generation

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a unique project key based on project name and industry
   */
  private async generateProjectKey(
    projectName: string,
    industry: string,
    accountId: string,
  ): Promise<string> {
    if (!projectName?.trim()) {
      throw new BadRequestException(
        'Project name is required for key generation',
      );
    }

    const prefix = this.generateProjectPrefix(projectName);
    const industryCode = this.generateIndustryCode(industry);
    const baseKey = `${prefix}-${industryCode}`;

    return await this.ensureUniqueProjectKey(baseKey, accountId);
  }

  /**
   * Generates a 4-character prefix from project name
   */
  private generateProjectPrefix(projectName: string): string {
    const words = projectName.trim().split(/\s+/);
    let prefix = '';

    if (words.length === 1) {
      prefix = words[0].substring(0, 4).toUpperCase();
    } else if (words.length === 2) {
      prefix =
        words[0].substring(0, 2).toUpperCase() +
        words[1].substring(0, 2).toUpperCase();
    } else {
      prefix = words
        .slice(0, 4)
        .map((word) => word[0]?.toUpperCase() || 'X')
        .join('');
    }

    // Pad to exactly 4 characters
    return prefix.padEnd(4, 'X').substring(0, 4);
  }

  /**
   * Generates a 3-character industry code
   */
  private generateIndustryCode(industry: string): string {
    return (industry?.substring(0, 3) || 'GEN').toUpperCase();
  }

  /**
   * Ensures the project key is unique within the account
   */
  private async ensureUniqueProjectKey(
    baseKey: string,
    accountId: string,
  ): Promise<string> {
    const existingKeys = await this.prisma.project.findMany({
      where: { accountId, projectKey: { startsWith: baseKey } },
      select: { projectKey: true },
    });

    const existingKeySet = new Set(existingKeys.map((p) => p.projectKey));

    if (!existingKeySet.has(baseKey)) {
      return baseKey;
    }

    // Find unique suffix
    for (let suffix = 1; suffix < PROJECT_KEY_GENERATION_LIMIT; suffix++) {
      const candidate = `${baseKey}-${suffix}`;
      if (!existingKeySet.has(candidate)) {
        return candidate;
      }
    }

    throw new BadRequestException(
      `Unable to generate unique project key. Limit of ${PROJECT_KEY_GENERATION_LIMIT} reached for this name and industry combination.`,
    );
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    this.logger.log(
      `Creating project: ${dto.name} for account: ${dto.accountId}`,
    );
    try {
      const projectKey = await this.generateProjectKey(
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

  async updateProject(
    projectId: string,
    dto: UpdateProjectDto,
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
          select: { name: true, slug: true },
        });
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
        where: { id: projectId },
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
  ): Promise<Project> {
    if (!dto.status) {
      throw new BadRequestException('Status is required');
    }

    this.logger.log(
      `Changing status for project ID: ${projectId} to ${dto.status}`,
    );

    try {
      const updatedProject = await this.prisma.project.update({
        where: { id: projectId },
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

  async listProjectsByAccount(accountId: string): Promise<Project[]> {
    if (!accountId) {
      throw new BadRequestException('Account ID is required');
    }

    this.logger.log(`Listing projects for account ID: ${accountId}`);

    return await this.prisma.project.findMany({
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
  }

  async addView(
    projectId: string,
    dto: CreateProjectViewDto,
  ): Promise<ProjectView> {
    this.logger.log(`Adding view for project ID: ${projectId}`);

    await this.findProjectById(projectId);

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

  async findByKey(projectKey: string): Promise<Project> {
    if (!projectKey) {
      throw new BadRequestException('Project key is required');
    }

    const project = await this.prisma.project.findFirst({
      where: { projectKey },
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

  async findProjectById(id: string): Promise<Project> {
    if (!id) {
      throw new BadRequestException('Project ID is required');
    }
    try {
      return await this.prisma.project.findUnique({
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
    } catch (error) {
      this.handlePrismaError(error, 'find project by ID');
    }
  }

  async archiveProject(projectId: string): Promise<Project> {
    try {
      const archivedProject = await this.prisma.project.update({
        where: { id: projectId },
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

  async searchProjects(params: SearchProjectsParams): Promise<{
    projects: Project[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { accountId, searchTerm, status, industry, limit, offset } = params;

    // Build the where clause dynamically
    const where: Prisma.ProjectWhereInput = {
      accountId,
      archived: false,
      // Add search term filter if provided
      ...(searchTerm && {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive', // Case-insensitive search
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            projectKey: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      }),
      // Add status filter if provided
      ...(status && { status }),
      // Add industry filter if provided
      ...(industry && { industry }),
    };

    // Execute both queries in a transaction for consistency
    const [projects, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
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
        orderBy: [
          { updatedAt: 'desc' }, // Most recently updated first
          { createdAt: 'desc' },
        ],
        skip: offset,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      projects,
      total,
      limit,
      offset,
    };
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
    const where: Prisma.ProjectWhereInput = {
      accountId,
      archived: false,
    };

    const [projects, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
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
        skip: offset,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      projects,
      total,
      limit,
      offset,
    };
  }

  // Optional: Add more specific search methods
  async searchProjectsByName(
    accountId: string,
    name: string,
    limit = 10,
  ): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: {
        accountId,
        archived: false,
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      include: {
        owner: true,
        _count: {
          select: { tasks: true, members: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: limit,
    });
  }

  // For autocomplete functionality
  async getProjectSuggestions(
    accountId: string,
    query: string,
    limit = 5,
  ): Promise<Array<{ id: string; name: string; projectKey: string }>> {
    return this.prisma.project.findMany({
      where: {
        accountId,
        archived: false,
        OR: [
          { name: { startsWith: query, mode: 'insensitive' } },
          { projectKey: { startsWith: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        projectKey: true,
      },
      orderBy: {
        name: 'asc',
      },
      take: limit,
    });
  }

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
