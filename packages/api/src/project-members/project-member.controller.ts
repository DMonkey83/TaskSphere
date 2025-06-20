import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectMember } from '@prisma/client';
import { ZodValidationPipe } from 'nestjs-zod';

import {
  AddProjectMemberSchema,
  RemoveProjectMemberSchema,
} from '@shared/dto/project-members.dto';

import { ProjectRoleGuard } from './../auth/role.guard';
import { ProjectRoles } from './../auth/roles.decorator';
import {
  AddProjectMemberDto,
  RemoveProjectMemberDto,
} from './dto/project-members.dto';
import { ProjectMemberService } from './project-member.service';

@Controller('project-members')
export class ProjectMemberController {
  constructor(private readonly projectMembersService: ProjectMemberService) {}

  @UseGuards(AuthGuard('jwt'), ProjectRoleGuard)
  @ProjectRoles('owner', 'project_manager')
  @Post()
  async addMember(
    @Body(new ZodValidationPipe(AddProjectMemberSchema))
    body: AddProjectMemberDto,
  ): Promise<ProjectMember> {
    return this.projectMembersService.addMember({
      userId: body.userId,
      projectId: body.projectId,
      role: body.role,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('project/:projectId')
  async listProjectMembers(
    @Param('projectId') projectId: string,
  ): Promise<ProjectMember[]> {
    return this.projectMembersService.listProjectMembers(projectId);
  }

  @UseGuards(AuthGuard('jwt'), ProjectRoleGuard)
  @ProjectRoles('owner', 'project_manager')
  @Delete()
  async removeMember(
    @Body(new ZodValidationPipe(RemoveProjectMemberSchema))
    body: RemoveProjectMemberDto,
  ): Promise<void> {
    return this.projectMembersService.removeMember(body.userId, body.projectId);
  }
}
