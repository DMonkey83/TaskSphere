import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
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
} from './dto/project.dto';
import { Roles } from '../auth/roles.decorator';
import { Project } from './entities/project.entity';

@Controller('projects')
export class ProjectController {
  private readonly logger = new Logger(ProjectsService.name);
  constructor(private projectsService: ProjectsService) {}

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'owner', 'admin')
  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateProjectDto))
    body: CreateProjectDto,
  ) {
    return this.projectsService.create({
      name: body.name,
      description: body.description,
      industry: body.industry,
      matterNumber: body.matterNumber,
      planningType: body.planningType,
      accountId: body.accountId,
      ownerId: body.ownerId,
    });
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'owner', 'admin')
  @Patch(':projectId')
  async updateProject(
    @Param('projectId') id: string,
    @Body(new ZodValidationPipe(UpdateProjectDto))
    body: UpdateProjectDto,
  ) {
    return this.projectsService.updateProject(id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':projectId/views')
  async addView(
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(CreateProjectViewDto))
    body: CreateProjectViewDto,
  ) {
    return this.projectsService.addView(projectId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':accountId')
  async listProjectsByAccauntId(
    @Param('acountId') id: string,
  ): Promise<Project[]> {
    this.logger.log('Listing projects for account ID:', id);
    return this.projectsService.listProjectsByAccount(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':projectKey')
  async getByKey(@Param('projectKey') projectKey: string) {
    this.logger.log('Listing projects for account ID:', projectKey);
    return this.projectsService.findByKey(projectKey);
  }
}
