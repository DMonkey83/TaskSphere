import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../auth/role.guard';
import { ZodValidationPipe } from 'nestjs-zod';
import {
  CreateProjectDto,
  CreateProjectViewDto,
  UpdateProjectDto,
  UpdateProjectStatusDto,
} from './dto/project.dto';
import { Roles } from '../auth/roles.decorator';
import { Project } from './entities/project.entity';
import {
  CreateProjectSchema,
  CreateProjectViewSchema,
  UpdateProjectSchema,
} from '../../../shared/src/dto/projects.dto';
import { ProjectView } from './entities/project-view.entity';
import { IndustriesEnum, ProjectStatusEnum } from '@shared/enumsTypes';

@Controller('projects')
export class ProjectController {
  private readonly logger = new Logger(ProjectsService.name);
  constructor(private readonly projectsService: ProjectsService) { }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'owner', 'admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(CreateProjectSchema))
    createProjectDto: CreateProjectDto,
  ) {
    this.logger.log(`Creating project: ${createProjectDto.name}`);
    try {
      const project = await this.projectsService.create(createProjectDto);
      this.logger.log(`Project created successfully: ${project.id}`);
      return project;
    } catch (error) {
      this.logger.error(
        `Failed to create project: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'owner', 'admin')
  @Patch(':projectId')
  async updateProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body(new ZodValidationPipe(UpdateProjectSchema))
    updateProjectDto: UpdateProjectDto,
  ) {
    this.logger.log(`Updating project: ${projectId}`);

    try {
      const project = await this.projectsService.updateProject(
        projectId,
        updateProjectDto,
      );
      this.logger.log(`Project updated successfully: ${project.id}`);
      return project;
    } catch (error) {
      this.logger.error(
        `Failed to update project: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'owner', 'admin')
  @Patch(':projectId/status')
  async updateProjectStatus(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body(new ZodValidationPipe(UpdateProjectSchema))
    updateStatusDto: UpdateProjectStatusDto,
  ): Promise<Project> {
    this.logger.log(
      `Updating status for project: ${projectId} to ${updateStatusDto.status}`,
    );

    try {
      const project = await this.projectsService.changeProjectStatus(
        projectId,
        updateStatusDto,
      );
      this.logger.log(`Project status updated successfully: ${projectId}`);
      return project;
    } catch (error) {
      this.logger.error(
        `Failed to update project status: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':projectId/views')
  @HttpCode(HttpStatus.CREATED)
  async addView(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body(new ZodValidationPipe(CreateProjectViewSchema))
    createProjectViewDto: CreateProjectViewDto,
  ): Promise<ProjectView> {
    this.logger.log(`Adding view to project: ${projectId}`);

    try {
      const view = await this.projectsService.addView(
        projectId,
        createProjectViewDto,
      );
      this.logger.log(`View added successfylly to project: ${projectId}`);
      return view;
    } catch (error) {
      this.logger.error(
        `Failed to add view: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':projectId')
  async getProjectById(
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ): Promise<Project> {
    this.logger.log('Listing projects for account ID:', projectId);

    try {
      const project = await this.projectsService.findProjectById(projectId);
      this.logger.log(`Project found by id: ${projectId}`);
      return project;
    } catch (error) {
      this.logger.error(
        `Failed to find project by id: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('key/:projectKey')
  async getProjectByKey(
    @Param('projectKey') projectKey: string,
  ): Promise<Project> {
    this.logger.log('Listing projects for account key:', projectKey);

    try {
      const project = await this.projectsService.findByKey(projectKey);
      this.logger.log(`Project found by Key: ${projectKey}`);
      return project;
    } catch (error) {
      this.logger.error(
        `Failed to find project by key: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'owner', 'admin')
  @Delete(':projectId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ): Promise<void> {
    this.logger.log(`Deleting project: ${projectId}`);

    try {
      await this.projectsService.archiveProject(projectId);
      this.logger.log(`Project archived successfully: ${projectId}`);
    } catch (error) {
      this.logger.error(
        `Failed to archive project: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('account/:accountId/stats')
  async getProjectStats(
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byIndustry: Record<string, number>;
  }> {
    this.logger.log('Getting project stats for account ID:', accountId);

    try {
      const stats = await this.projectsService.getProjectStats(accountId);
      this.logger.log(`Project stats retrieved for account ID: ${accountId}`);
      return stats;
    } catch (error) {
      this.logger.error(
        `Failed to get project stats: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('account/:accountId/search')
  async searchProjects(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Query('q') searchTerm?: string,
    @Query('status') status?: ProjectStatusEnum,
    @Query('industry') industry?: IndustriesEnum,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ): Promise<{
    projects: Project[];
    total: number;
    limit: number;
    offset: number;
  }> {
    this.logger.log(
      'Searching projects for account: ${accountId} with terms ${searchTerm}',
    );
    try {
      const projects =
        await this.projectsService.listProjectsByAccount(accountId);
      let filteredProjects = projects;

      if (searchTerm) {
        filteredProjects = filteredProjects.filter(
          (project) =>
            project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description
              ?.toLocaleLowerCase()
              .includes(searchTerm.toLowerCase()),
        );
      }
      if (status) {
        filteredProjects = filteredProjects.filter(
          (project) => project.status === status,
        );
      }

      if (industry) {
        filteredProjects = filteredProjects.filter(
          (project) => project.industry === industry,
        );
      }

      const total = filteredProjects.length;
      const paginatedProjects = filteredProjects.slice(offset, offset + limit);

      this.logger.log(`Found ${total} projects matching search criteria`);

      return {
        projects: paginatedProjects,
        total,
        limit,
        offset,
      };
    } catch (error) {
      this.logger.error(
        `Failed to search projects: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
