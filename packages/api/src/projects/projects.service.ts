import { AccountsService } from './../accounts/accounts.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectView } from './entities/project-view.entity';
import { Repository } from 'typeorm';
import {
  CreateProjectDto,
  CreateProjectViewDto,
  UpdateProjectDto,
} from './dto/project.dto';
import { ProjectMemberService } from '../project-members/project-member.service';
import { DeepPartial } from 'react-hook-form';

@Injectable()
export class ProjectsService {
  private projectCounts: { [industry: string]: number } = {
    programming: 0,
    legal: 0,
    logistics: 0,
    other: 0,
  };
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(ProjectView)
    private projectViewsRepository: Repository<ProjectView>,
    private projectMembersService: ProjectMemberService,
    private accountsService: AccountsService,
  ) { }

  private async generateProjectKey(
    projectName: string,
    industry: string,
    accountId: string,
  ): Promise<string> {
    // Step 1: Generate 4-letter prefix from project name
    const words = projectName.trim().split(/\s+/);
    let prefix = '';

    if (words.length === 1) {
      // Single word: take first 4 characters
      prefix = words[0].substring(0, 4).toUpperCase();
    } else if (words.length === 2) {
      // Two words: first 2 characters of each
      prefix =
        words[0].substring(0, 2).toUpperCase() +
        words[1].substring(0, 2).toUpperCase();
    } else {
      // 3+ words: take first letter of first 4 words
      prefix = words
        .slice(0, 4)
        .map((w) => w[0].toUpperCase())
        .join('');
    }

    // Pad to exactly 4 characters
    prefix = (prefix + 'XXXX').substring(0, 4);

    // Step 2: Use 3-letter industry code
    const industryCode = (industry.substring(0, 3) || 'GEN').toUpperCase();

    // Step 3: Combine to baseKey
    const baseKey = `${prefix}-${industryCode}`;

    // Step 4: Check existing keys
    const existingKeys = await this.projectsRepository.find({
      where: { account: { id: accountId } },
      select: ['projectKey'],
    });

    const existingKeySet = new Set(existingKeys.map((p) => p.projectKey));

    if (!existingKeySet.has(baseKey)) return baseKey;

    // Step 5: Append suffix if needed
    let suffix = 1;
    while (suffix < 1000) {
      const candidate = `${baseKey}-${suffix}`;
      if (!existingKeySet.has(candidate)) return candidate;
      suffix++;
    }

    throw new Error('Project key limit reached for this name and industry');
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    const account = await this.accountsService.findById(dto.accountId);
    const industry = dto.industry || account?.industry || null;
    const projectKey = await this.generateProjectKey(
      dto.name,
      industry,
      dto.accountId,
    );
    const project = this.projectsRepository.create({
      projectKey,
      name: dto.name,
      description: dto.description,
      owner: { id: dto.ownerId },
      account: { id: dto.accountId },
      industry,
      workflow: dto.workflow || 'kanban',
      matterNumber: dto.matterNumber,
    } as DeepPartial<Project>);
    const savedProject = await this.projectsRepository.save(project);

    await this.projectMembersService.addMember({
      userId: dto.ownerId,
      projectId: savedProject.id,
      role: 'owner',
    });

    return savedProject;
  }

  async updateProject(
    projectId: string,
    dto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    let projectKey = '';
    if (project.name !== dto.name || project.industry !== dto.industry) {
      projectKey = await this.generateProjectKey(
        dto.name,
        dto.industry,
        project.account.id,
      );
    }

    Object.assign(project, {
      projectKey: projectKey ?? project.projectKey,
      name: dto.name ?? project.name,
      description: dto.description ?? project.description,
      status: dto.status ?? project.status,
      workflow: dto.workflow ?? project.workflow,
      startDate: dto.startDate ?? project.startDate,
      endDate: dto.endDate ?? project.endDate,
      matterNumber: dto.matterNumber ?? project.matterNumber,
    });

    return this.projectsRepository.save(project);
  }

  async listProjectsByAccount(accountId: string): Promise<Project[]> {
    this.logger.log(`Listing projects for account ID: ${accountId}`);
    return this.projectsRepository.find({
      where: { account: { id: accountId } },
      relations: ['owner', 'account'],
      order: { createdAt: 'DESC' },
    });
  }

  async addView(
    projectId: string,
    dto: CreateProjectViewDto,
  ): Promise<ProjectView> {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    const view = this.projectViewsRepository.create({
      project: { id: projectId },
      viewType: dto.viewType,

      configuration: dto.configuration,
    });
    return this.projectViewsRepository.save(view);
  }

  async findByKey(projectKey: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { projectKey },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async findById(id: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }
}
