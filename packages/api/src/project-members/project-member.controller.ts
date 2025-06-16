import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectMember } from '@prisma/client';
import { ZodValidationPipe } from 'nestjs-zod';

import { PrismaService } from 'src/prisma/prisma.service';

import { ProjectRoles } from './../auth/roles.decorator';
import { ProjectsService } from './../projects/projects.service';
import { UsersService } from './../users/users.service';
import {
  AddProjectMemberDto,
  RemoveProjectMemberDto,
} from './dto/project-members.dto';
import { ProjectMemberService } from './project-member.service';

@Controller('project-members')
export class ProjectMemberController {
  constructor(
    private prisma: PrismaService,
    private readonly projectMembersService: ProjectMemberService,
    private readonly userService: UsersService,
    private readonly projectsService: ProjectsService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @ProjectRoles('owner', 'project_manager')
  @Post()
  async addMember(
    @Body(new ZodValidationPipe(AddProjectMemberDto)) body: AddProjectMemberDto,
  ): Promise<ProjectMember> {
    const user = await this.userService.findById(body.userId);
    if (!user) throw new NotFoundException('User not found');
    const project = await this.projectsService.findProjectById(body.projectId);
    if (!project) throw new NotFoundException('project not found');
    const projectMember = await this.prisma.projectMember.findFirst({
      where: { user: { id: user.id }, project: { id: project.id } },
    });
    if (projectMember) throw new BadRequestException('Member already added');
    return this.projectMembersService.addMember({
      userId: user.id,
      projectId: project.id,
      role: body.role || 'member',
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @ProjectRoles('owner', 'project_manager', 'member')
  @Get('project/:projectId')
  async listProjectMembers(
    @Param('projectId') projectId: string,
  ): Promise<ProjectMember[]> {
    return this.projectMembersService.listProjectMembers(projectId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ProjectRoles('owner', 'project_manager')
  @Delete()
  async removeMember(
    @Body(new ZodValidationPipe()) body: RemoveProjectMemberDto,
  ): Promise<void> {
    return this.projectMembersService.removeMember(body.userId, body.projectId);
  }
}
