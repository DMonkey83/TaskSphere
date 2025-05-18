import { AccountsService } from './../accounts/accounts.service';
import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class ProjectsService {
  private projectCounts: { [industry: string]: number } = {
    programming: 0,
    legal: 0,
    logistics: 0,
    other: 0,
  };

  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(ProjectView)
    private projectViewsRepository: Repository<ProjectView>,
    private projectMembersService: ProjectMemberService,
    private accountsService: AccountsService,
  ) {}

  private async generateProjectKey(
    projectName: string,
    industry: string,
    accountId: string,
  ): Promise<string> {
    const words = projectName.trim().split(/\s+/);
    let initials = words.map((word) => word[0].toUpperCase()).join('');

    if (initials.length < 3 && words.length > 0) {
      const lastWord = words[words.length - 1];
      const needed = 3 - initials.length;
      initials += lastWord.slice(1, 1 + needed).toUpperCase();
    } else if (initials.length > 3) {
      initials = initials.slice(0, 3);
    }

    const industryInitial = industry[0]?.toUpperCase() || 'X';
    const baseKey = `${initials}${industryInitial || 'O'}`;

    // Get existing project keys for this account
    const existingKeys = await this.projectsRepository.find({
      where: { account: { id: accountId } },
      select: ['projectKey'],
    });
    const existingKeySet = new Set(existingKeys.map((p) => p.projectKey));

    if (!existingKeySet.has(baseKey)) return baseKey;

    let suffix = 1;
    while (true) {
      const candidate = `${baseKey}${suffix}`;
      if (!existingKeySet.has(candidate)) return candidate;
      suffix++;
    }
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
      planningType: dto.planningType,
      matterNumber: dto.matterNumber,
    });
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
      planningType: dto.planningType ?? project.planningType,
      startDate: dto.startDate ?? project.startDate,
      endDate: dto.endDate ?? project.endDate,
      matterNumber: dto.matterNumber ?? project.matterNumber,
    });

    return this.projectsRepository.save(project);
  }

  async listProjectsByAccount(accountId: string): Promise<Project[]> {
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
