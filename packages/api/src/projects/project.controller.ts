import {
  Body,
  Controller,
  Get,
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
  CreateProjectDtoClass,
  CreateProjectViewDtoClass,
  UpdateProjectDtoClass,
} from './dto/project.dto';
import { Roles } from '../auth/roles.decorator';

@Controller('projects')
export class ProjectController {
  constructor(private projectsService: ProjectsService) {}

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'owner', 'admin')
  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateProjectDtoClass))
    body: CreateProjectDtoClass,
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
    @Body(new ZodValidationPipe(UpdateProjectDtoClass))
    body: UpdateProjectDtoClass,
  ) {
    return this.projectsService.updateProject(id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':projectId/views')
  async addView(
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(CreateProjectViewDtoClass))
    body: CreateProjectViewDtoClass,
  ) {
    return this.projectsService.addView(projectId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':accountId')
  async listProjectsByAccauntId(@Param('acountId') id: string) {
    return this.projectsService.listProjectsByAccount(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':projectKey')
  async getByKey(@Param('projectKey') projectKey: string) {
    return this.projectsService.findByKey(projectKey);
  }
}
