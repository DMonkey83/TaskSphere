import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectMember } from '@prisma/client';

import { RoleEnum } from '@shared/enumsTypes';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectMemberService {
  constructor(private prisma: PrismaService) {}

  async addMember(data: {
    userId: string;
    projectId: string;
    role: 'owner' | 'project_manager' | 'member';
  }): Promise<ProjectMember> {
    const member = await this.prisma.projectMember.create({
      data: {
        user: { connect: { id: data.userId } },
        project: { connect: { id: data.projectId } },
        role: data.role,
      },
    });
    return member;
  }

  async getUserRoleInProject(
    userId: string,
    projectId: string,
  ): Promise<RoleEnum | null> {
    const member = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    return (member?.role as RoleEnum) ?? null;
  }

  async listProjectMembers(projectId: string): Promise<ProjectMember[]> {
    const members: ProjectMember[] = await this.prisma.projectMember.findMany({
      where: { projectId: projectId },
    });
    return members;
  }

  async removeMember(userId: string, projectId: string): Promise<void> {
    const member = await this.prisma.projectMember.deleteMany({
      where: {
        userId,
        projectId,
      },
    });

    if (member.count === 0) {
      throw new NotFoundException(
        `Member with userId ${userId} not found in project ${projectId}`,
      );
    }
  }
}
