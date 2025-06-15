import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from 'nestjs-zod';

import { GetUser } from 'src/auth/get-user.decorator';

import { ProjectsService } from './projects.service';
import {
  Project,
  ProjectIndustryEnum,
  ProjectStatusEnum,
  ProjectView,
  User,
} from '../../generated/prisma';
import { RoleGuard } from '../auth/role.guard';
import {
  CreateProjectDto,
  CreateProjectViewDto,
  UpdateProjectDto,
  UpdateProjectStatusDto,
} from './dto/project.dto';
import {
  CreateProjectSchema,
  CreateProjectViewSchema,
  UpdateProjectSchema,
} from '../../../shared/src/dto/projects.dto';
import { Roles } from '../auth/roles.decorator';

@Controller('projects')
export class ProjectController {
  private readonly logger = new Logger(ProjectsService.name);
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'owner', 'admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(CreateProjectSchema))
    createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    this.logger.log(`Creating project: ${createProjectDto.name}`);
    return this.projectsService.create(createProjectDto);
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'owner', 'admin')
  @Patch(':projectId')
  async updateProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body(new ZodValidationPipe(UpdateProjectSchema))
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    this.logger.log(`Updating project: ${projectId}`);

    return this.projectsService.updateProject(projectId, updateProjectDto);
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

    return this.projectsService.changeProjectStatus(projectId, updateStatusDto);
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

    return this.projectsService.addView(projectId, createProjectViewDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':projectId')
  async getProjectById(
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ): Promise<Project> {
    this.logger.log('Listing projects for account ID:', projectId);

    return this.projectsService.findProjectById(projectId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('key/:projectKey')
  async getProjectByKey(
    @Param('projectKey') projectKey: string,
  ): Promise<Project> {
    this.logger.log('Listing projects for account key:', projectKey);
    return this.projectsService.findByKey(projectKey);
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'owner', 'admin')
  @Delete(':projectId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @GetUser() user: User,
  ): Promise<void> {
    this.logger.log(`Archiving project: ${projectId} by user: ${user.email}`);
    await this.projectsService.archiveProject(projectId);
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
    this.logger.log('Getting project stats for account:', accountId);
    return this.projectsService.getProjectStats(accountId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('account/:accountId/search')
  async searchProjects(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Query('q') searchTerm?: string,
    @Query('status') status?: ProjectStatusEnum,
    @Query('industry') industry?: ProjectIndustryEnum,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ): Promise<{
    projects: Project[];
    total: number;
    limit: number;
    offset: number;
  }> {
    this.logger.log(
      `Searching projects for account: ${accountId} with terms ${searchTerm}`,
    );

    return this.projectsService.searchProjects({
      accountId,
      searchTerm,
      status: status,
      industry: industry,
      limit: limit || 20,
      offset: offset || 0,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('account/:accountId')
  async listProjects(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @GetUser() user: User,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ): Promise<{
    projects: Project[];
    total: number;
    limit: number;
    offset: number;
  }> {
    this.logger.log(
      `Listing projects for account ID: ${accountId} by user: ${user.email}`,
    );
    return this.projectsService.listProjectsPaginated(
      accountId,
      limit || 20,
      offset || 0,
    );
  }
}
