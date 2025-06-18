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
import {
  Project,
  ProjectIndustryEnum,
  ProjectStatusEnum,
  ProjectView,
  User,
} from '@prisma/client';
import { ZodValidationPipe } from 'nestjs-zod';

import { GetUser } from 'src/auth/get-user.decorator';

import { ProjectsService } from './projects.service';
import { UserPayload } from '../auth/dto/auth.dto';
import { RoleGuard } from '../auth/role.guard';
import {
  CreateProjectRequestDto,
  CreateProjectViewDto,
  UpdateProjectDto,
  UpdateProjectStatusDto,
} from './dto/project.dto';
import {
  CreateProjectRequestSchema,
  CreateProjectViewSchema,
  UpdateProjectSchema,
} from '../../../shared/src/dto/projects.dto';
import { Roles } from '../auth/roles.decorator';
import { TaskFilterDto, TaskListResponseDto } from '../tasks/dto/task.dto';
import { TaskService } from '../tasks/task.service';

@Controller('projects')
export class ProjectController {
  private readonly logger = new Logger(ProjectsService.name);
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly taskService: TaskService,
  ) {}

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'owner', 'admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(CreateProjectRequestSchema))
    createProjectRequestDto: CreateProjectRequestDto,
    @GetUser() user: UserPayload,
  ): Promise<Project> {
    this.logger.log(
      `Creating project: ${createProjectRequestDto.name} for account: ${user.account.id}`,
    );
    // Ensure the project is created for the authenticated user's account
    const projectData = {
      ...createProjectRequestDto,
      accountId: user.account.id,
      ownerId: user.userId,
      workflow: createProjectRequestDto.workflow || 'kanban',
    };
    this.logger.debug(
      `Project data being sent: ${JSON.stringify(projectData)}`,
    );
    const result = await this.projectsService.create(projectData);
    this.logger.debug(`Controller received result: ${JSON.stringify(result)}`);
    return result;
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
  @Get('all')
  async listAllProjects(@GetUser() user: UserPayload): Promise<Project[]> {
    this.logger.log(`Listing all projects for account: ${user.account.id}`);
    return this.projectsService.listProjectsByAccount(user.account.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('stats')
  async getProjectStats(@GetUser() user: UserPayload): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byIndustry: Record<string, number>;
  }> {
    this.logger.log('Getting project stats for account:', user.account.id);
    return this.projectsService.getProjectStats(user.account.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('search')
  async searchProjects(
    @GetUser() user: UserPayload,
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
      `Searching projects for account: ${user.account.id} with terms ${searchTerm}`,
    );

    return this.projectsService.searchProjects({
      accountId: user.account.id,
      searchTerm,
      status: status,
      industry: industry,
      limit: limit || 20,
      offset: offset || 0,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('suggestions')
  async getProjectSuggestions(
    @GetUser() user: UserPayload,
    @Query('q') query?: string,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit?: number,
  ): Promise<Array<{ id: string; name: string; projectKey: string }>> {
    this.logger.log(`Getting project suggestions for: ${query}`);
    return this.projectsService.getProjectSuggestions(
      user.account.id,
      query || '',
      limit || 5,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('key/:projectKey')
  async getProjectByKey(
    @Param('projectKey') projectKey: string,
  ): Promise<Project> {
    this.logger.log('Listing projects for account key:', projectKey);
    return this.projectsService.findByKey(projectKey);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':projectId')
  async getProjectById(
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ): Promise<Project> {
    this.logger.log('Listing projects for account ID:', projectId);

    return this.projectsService.findProjectById(projectId);
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
  @Get()
  async listProjects(
    @GetUser() user: UserPayload,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ): Promise<{
    projects: Project[];
    total: number;
    limit: number;
    offset: number;
  }> {
    this.logger.log(
      `Listing projects for account ID: ${user.account.id} by user: ${user.userId}`,
    );
    return this.projectsService.listProjectsPaginated(
      user.account.id,
      limit || 20,
      offset || 0,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':projectId/tasks')
  async getProjectTasks(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() filters: Omit<TaskFilterDto, 'projectId'>,
    @GetUser() user: UserPayload,
  ): Promise<TaskListResponseDto> {
    this.logger.log(`Fetching tasks for project: ${projectId}`);
    return this.taskService.findByProject(projectId, filters, user);
  }
}
