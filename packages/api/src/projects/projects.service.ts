import { AccountsService } from './../accounts/accounts.service';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectView } from './entities/project-view.entity';
import { DataSource, Repository } from 'typeorm';
import {
  CreateProjectDto,
  CreateProjectViewDto,
  UpdateProjectDto,
  UpdateProjectStatusDto,
} from './dto/project.dto';
import { ProjectMemberService } from '../project-members/project-member.service';
import { DeepPartial } from 'react-hook-form';
import { VisiblityEnum } from '@shared/enumsTypes/visibility.enum';
import {
  IndustriesEnum,
  ProjectStatusEnum,
  RoleEnum,
} from '@shared/enumsTypes';
import { slugify } from 'src/common/slugify.util';

const PROJECT_KEY_GENERATION_LIMIT = 99; // Limit for unique key generation

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(ProjectView)
    private readonly projectViewsRepository: Repository<ProjectView>,
    private readonly projectMembersService: ProjectMemberService,
    private readonly accountsService: AccountsService,
    private readonly dataSourse: DataSource,
  ) {}

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

    const uniqueKey = await this.ensureUniqueProjectKey(baseKey, accountId);

    return uniqueKey;
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
    return (prefix + 'XXXX').substring(0, 4);
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
    const existingKeys = await this.projectsRepository.find({
      where: { account: { id: accountId } },
      select: ['projectKey'],
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
    return this.dataSourse.transaction(async () => {
      try {
        const projectKey = await this.generateProjectKey(
          dto.name,
          dto.industry || IndustriesEnum.Other,
          dto.accountId,
        );
        const slug = slugify(dto.name);
        const project = this.projectsRepository.create({
          projectKey,
          name: dto.name,
          description: dto.description,
          owner: { id: dto.ownerId },
          account: { id: dto.accountId },
          industry: dto.industry as IndustriesEnum,
          workflow: dto.workflow || 'kanban',
          matterNumber: dto.matterNumber,
          slug,
          visibility: (dto.visibility as VisiblityEnum) || 'private',
          tags: dto.tags || [],
          startDate: dto.startDate || null,
          endDate: dto.endDate || null,
          config: dto.config || {},
          status: ProjectStatusEnum.Planned,
        } as DeepPartial<Project>);

        const savedProject = await this.projectsRepository.save(project);

        await this.projectMembersService.addMember({
          userId: dto.ownerId,
          projectId: savedProject.id,
          role: RoleEnum.Owner,
        });

        this.logger.log(`Project created successfully: ${savedProject.id}`);
        return savedProject;
      } catch (error) {
        this.logger.error(`Failed to create project: ${error as string}`);
        throw error;
      }
    });
  }

  async updateProject(
    projectId: string,
    dto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    const slug =
      dto.name && dto.name !== project.name ? slugify(dto.name) : project.slug;

    Object.assign(project, {
      name: dto.name ?? project.name,
      description: dto.description ?? project.description,
      industry: (dto.industry as IndustriesEnum) ?? project.industry,
      workflow: dto.workflow ?? project.workflow,
      matterNumber: dto.matterNumber ?? project.matterNumber,
      slug,
      visibility: (dto.visibility as VisiblityEnum) ?? project.visibility,
      tags: dto.tags ?? project.tags,
      startDate: dto.startDate ?? (project.startDate || null),
      endDate: dto.endDate ?? (project.endDate || null),
      config: dto.config ?? project.config,
    });
    const updatedProject = await this.projectsRepository.save(project);
    this.logger.log(`Project updated successfully: ${projectId}`);

    return updatedProject;
  }

  async changeProjectStatus(
    projectId: string,
    dto: UpdateProjectStatusDto,
  ): Promise<Project> {
    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }

    if (!dto.status) {
      throw new BadRequestException('Status is required');
    }

    this.logger.log(
      `Changing status for project ID: ${projectId} to ${dto.status}`,
    );

    const project = await this.findProjectById(projectId);

    project.status = dto.status as ProjectStatusEnum;

    const updatedProject = await this.projectsRepository.save(project);
    this.logger.log(`Project status updated successfully: ${projectId}`);

    return updatedProject;
  }
  async listProjectsByAccount(accountId: string): Promise<Project[]> {
    if (!accountId) {
      throw new BadRequestException('Account ID is required');
    }

    this.logger.log(`Listing projects for account ID: ${accountId}`);

    return this.projectsRepository.find({
      where: {
        account: { id: accountId },
        archived: false,
      },
      relations: { owner: true, account: true },
      order: { createdAt: 'DESC' },
      select: {
        owner: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
        account: {
          id: true,
          name: true,
        },
      },
    });
  }

  async addView(
    projectId: string,
    dto: CreateProjectViewDto,
  ): Promise<ProjectView> {
    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }
    this.logger.log(`Adding view for project ID: ${projectId}`);

    await this.findProjectById(projectId);

    const view = this.projectViewsRepository.create({
      project: { id: projectId },
      viewType: dto.viewType,
      configuration: dto.configuration || {},
    });

    const savedView = await this.projectViewsRepository.save(view);
    this.logger.log(`View added successfully for project ID: ${projectId}`);
    return savedView;
  }

  async findByKey(projectKey: string): Promise<Project> {
    if (!projectKey) {
      throw new BadRequestException('Project key is required');
    }
    const project = await this.projectsRepository.findOne({
      where: { projectKey },
      relations: { owner: true, account: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async findProjectById(id: string): Promise<Project> {
    if (!id) {
      throw new BadRequestException('Project ID is required');
    }
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: { owner: true, account: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async archiveProject(projectId: string): Promise<Project> {
    const project = await this.findProjectById(projectId);

    project.archived = true;

    const archivedProject = await this.projectsRepository.save(project);
    this.logger.log(`Project archived successfully: ${projectId}`);

    return archivedProject;
  }

  async getProjectStats(accountId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byIndustry: Record<string, number>;
  }> {
    const projects = await this.projectsRepository.find({
      where: {
        account: { id: accountId },
        archived: false,
      },
      select: ['status', 'industry'],
    });

    const byStatus = projects.reduce(
      (acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byIndustry = projects.reduce(
      (acc, project) => {
        const industry = project.industry || IndustriesEnum.Other;
        acc[industry] = (acc[industry] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total: projects.length,
      byStatus,
      byIndustry,
    };
  }
}
