import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ProjectMember, MemberRoleEnum } from '@prisma/client';

import { RoleEnum } from '@shared/enumsTypes';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectMemberService {
  constructor(private prisma: PrismaService) {}

  async addMember(data: {
    userId: string;
    projectId: string;
    role: MemberRoleEnum;
  }): Promise<ProjectMember> {
    return await this.prisma.$transaction(async (tx) => {
      // Check if user exists
      const user = await tx.user.findUnique({
        where: { id: data.userId },
        select: { id: true },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if project exists
      const project = await tx.project.findUnique({
        where: { id: data.projectId },
        select: { id: true },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }

      // Check if member already exists
      const existingMember = await tx.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: data.userId,
            projectId: data.projectId,
          },
        },
      });
      if (existingMember) {
        throw new BadRequestException(
          'User is already a member of this project',
        );
      }

      // Create the member
      const member = await tx.projectMember.create({
        data: {
          userId: data.userId,
          projectId: data.projectId,
          role: data.role,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return member;
    });
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
    // First verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const members = await this.prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });
    return members;
  }

  async removeMember(userId: string, projectId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Check if project exists
      const project = await tx.project.findUnique({
        where: { id: projectId },
        select: { id: true },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }

      // Check if member exists
      const existingMember = await tx.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId,
            projectId,
          },
        },
      });
      if (!existingMember) {
        throw new NotFoundException('User is not a member of this project');
      }

      // Remove the member
      await tx.projectMember.delete({
        where: {
          userId_projectId: {
            userId,
            projectId,
          },
        },
      });
    });
  }
}
