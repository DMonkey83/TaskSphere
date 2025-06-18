import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRoleEnum } from '@prisma/client';

import {
  AddTeamMemberSchema,
  CreateTeamSchema,
  UpdateTeamSchema,
} from '@shared/dto/team.dto';

import { UserPayload } from '../auth/dto/auth.dto';
import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTeamDto,
  TeamResponseDto,
  AddTeamMemberDto,
  UpdateTeamDto,
} from './dto/team.dto';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async createTeam(
    dto: CreateTeamDto,
    user: UserPayload,
  ): Promise<TeamResponseDto> {
    const validatedDto = CreateTeamSchema.parse(dto);

    this.logger.log(
      `Creating team: ${validatedDto.name} by user: ${user.userId}`,
    );

    // Check permissions
    if (!this.hasTeamManagementPermission(user.role)) {
      throw new ForbiddenException(
        'You do not have permission to create a team',
      );
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Validate project exists and user has access (if projectId provided)
        if (validatedDto.projectId) {
          const project = await tx.project.findFirst({
            where: {
              id: validatedDto.projectId,
              accountId: user.account.id,
            },
          });

          if (!project) {
            throw new NotFoundException('Project not found or access denied');
          }
        }

        // Validate members exist and belong to same account (if memberIds provided)
        if (validatedDto.memberIds && validatedDto.memberIds.length > 0) {
          const memberUsers = await tx.user.findMany({
            where: {
              id: { in: validatedDto.memberIds },
              accountId: user.account.id,
            },
          });

          if (memberUsers.length !== validatedDto.memberIds.length) {
            throw new BadRequestException(
              'One or more members not found or do not belong to your account',
            );
          }
        }

        // Create the team
        const team = await tx.team.create({
          data: {
            name: validatedDto.name,
            description: validatedDto.description || null,
            accountId: user.account.id,
          },
        });

        // Add project relationship if provided
        if (validatedDto.projectId) {
          await tx.projectTeam.create({
            data: {
              projectId: validatedDto.projectId,
              teamId: team.id,
            },
          });
        }

        // Add member relationships if provided
        if (validatedDto.memberIds && validatedDto.memberIds.length > 0) {
          await tx.teamMember.createMany({
            data: validatedDto.memberIds.map((userId) => ({
              teamId: team.id,
              usersId: userId,
            })),
          });
        }

        // Fetch the complete team with relations
        const completeTeam = await tx.team.findUnique({
          where: { id: team.id },
          include: {
            members: {
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
            },
            projects: {
              include: {
                project: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                  },
                },
              },
            },
            _count: {
              select: {
                members: true,
                projects: true,
              },
            },
          },
        });

        this.logger.log(`Team created successfully with ID: ${team.id}`);
        return completeTeam as TeamResponseDto;
      });

      return {
        ...result,
        members: result.members,
        projects: result.projects,
      } as TeamResponseDto;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      this.logger.error(
        `Error creating team: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new BadRequestException('Failed to create team');
    }
  }

  async addTeamMember(
    dto: AddTeamMemberDto,
    user: UserPayload,
  ): Promise<TeamResponseDto> {
    const validatedDto = AddTeamMemberSchema.parse(dto);

    this.logger.log(
      `Adding member ${validatedDto.userId} to team ${validatedDto.teamId}`,
    );

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Check if team exists and user has access
        const team = await tx.team.findFirst({
          where: {
            id: validatedDto.teamId,
            accountId: user.account.id,
          },
          include: {
            members: {
              select: { usersId: true },
            },
          },
        });

        if (!team) {
          throw new NotFoundException('Team not found or access denied');
        }

        // Check permissions (team member or has management permission)
        const isTeamMember = team.members.some(
          (member) => member.usersId === user.userId,
        );
        if (!isTeamMember && !this.hasTeamManagementPermission(user.role)) {
          throw new ForbiddenException(
            'You do not have permission to add members to this team',
          );
        }

        // Check if user to be added exists and belongs to same account
        const userToAdd = await tx.user.findFirst({
          where: {
            id: validatedDto.userId,
            accountId: user.account.id,
          },
        });

        if (!userToAdd) {
          throw new NotFoundException(
            'User not found or does not belong to your account',
          );
        }

        // Check if user is already a member
        const existingMembership = await tx.teamMember.findFirst({
          where: {
            teamId: validatedDto.teamId,
            usersId: validatedDto.userId,
          },
        });

        if (existingMembership) {
          throw new BadRequestException(
            'User is already a member of this team',
          );
        }

        // Add member to team
        await tx.teamMember.create({
          data: {
            teamId: validatedDto.teamId,
            usersId: validatedDto.userId,
          },
        });

        // Fetch updated team with relations
        const updatedTeam = await tx.team.findUnique({
          where: { id: validatedDto.teamId },
          include: {
            members: {
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
            },
            projects: {
              include: {
                project: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                  },
                },
              },
            },
            _count: {
              select: {
                members: true,
                projects: true,
              },
            },
          },
        });

        this.logger.log(
          `Member added successfully to team ${validatedDto.teamId}`,
        );
        return updatedTeam as TeamResponseDto;
      });

      return {
        ...result,
        members: result.members,
        projects: result.projects,
      } as TeamResponseDto;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      this.logger.error(
        `Error adding team member: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new BadRequestException('Failed to add team member');
    }
  }

  async removeTeamMember(
    teamId: string,
    userId: string,
    user: UserPayload,
  ): Promise<void> {
    this.logger.log(`Removing member ${userId} from team ${teamId}`);

    try {
      await this.prisma.$transaction(async (tx) => {
        // Check if team exists and user has access
        const team = await tx.team.findFirst({
          where: {
            id: teamId,
            accountId: user.account.id,
          },
          include: {
            members: {
              select: { usersId: true },
            },
          },
        });

        if (!team) {
          throw new NotFoundException('Team not found or access denied');
        }

        // Check permissions
        const isTeamMember = team.members.some(
          (member) => member.usersId === userId,
        );
        const isRemovingSelf = userId === user.userId;

        if (
          !isRemovingSelf &&
          !isTeamMember &&
          !this.hasTeamManagementPermission(user.role)
        ) {
          throw new ForbiddenException(
            'You do not have permission to remove members from this team',
          );
        }

        // Check if user is actually a member
        const membership = await tx.teamMember.findFirst({
          where: {
            teamId,
            usersId: userId,
          },
        });

        if (!membership) {
          throw new BadRequestException('User is not a member of this team');
        }

        // Remove member from team
        await tx.teamMember.delete({
          where: {
            teamId_usersId: {
              teamId: teamId,
              usersId: membership.usersId,
            },
          },
        });

        this.logger.log(`Member removed successfully from team ${teamId}`);
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      this.logger.error(
        `Error removing team member: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new BadRequestException('Failed to remove team member');
    }
  }

  async listTeamsByAccount(
    accountId: string,
    user: UserPayload,
    skip = 0,
    take = 20,
  ): Promise<TeamResponseDto[]> {
    this.logger.log(`Fetching teams for account: ${accountId}`);

    // Ensure user can only access their own account's teams
    if (accountId !== user.account.id) {
      throw new ForbiddenException('Access denied to this account');
    }

    try {
      // For admin-level users, we can cache the full team list
      const isAdminUser = this.hasTeamManagementPermission(user.role);
      const cacheKey = isAdminUser
        ? this.cacheService.teamsByAccountKey(accountId)
        : `teams:account:${accountId}:user:${user.userId}`;

      // Try cache first (only for admin users for now to keep it simple)
      if (isAdminUser) {
        const cachedTeams =
          await this.cacheService.get<TeamResponseDto[]>(cacheKey);
        if (cachedTeams) {
          this.logger.log(
            `Cache hit: Found ${cachedTeams.length} teams for account ${accountId}`,
          );
          return cachedTeams.slice(skip, skip + take);
        }
      }

      let whereClause;

      if (isAdminUser) {
        // Admins, project managers, and owners can see all teams in the account
        whereClause = { accountId };
      } else {
        // Regular members can only see teams they belong to
        whereClause = {
          accountId,
          members: {
            some: { userId: user.userId },
          },
        };
      }

      const teams = (await this.prisma.team.findMany({
        where: whereClause,
        include: {
          members: {
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
          },
          projects: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
          _count: {
            select: {
              members: true,
              projects: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      })) as TeamResponseDto[];

      const mappedTeams = teams.map((team) => ({
        ...team,
        members: team.members,
        projects: team.projects,
      })) as TeamResponseDto[];

      // Cache results for admin users
      if (isAdminUser && mappedTeams.length > 0) {
        await this.cacheService.set(cacheKey, mappedTeams, 300); // 5 minutes
        this.logger.log(
          `Cache miss: Found ${mappedTeams.length} teams for account ${accountId}`,
        );
      }

      return mappedTeams;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(
        `Error fetching teams: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new BadRequestException('Failed to fetch teams');
    }
  }

  async getTeamDetails(
    id: string,
    user: UserPayload,
  ): Promise<TeamResponseDto> {
    this.logger.log(`Fetching team details for ID: ${id}`);

    try {
      let whereClause: any = {
        id,
        accountId: user.account.id,
      };

      // If user doesn't have management permission, they can only see teams they're a member of
      if (!this.hasTeamManagementPermission(user.role)) {
        whereClause = {
          ...whereClause,
          members: {
            some: { userId: user.userId },
          },
        };
      }

      const team = await this.prisma.team.findFirst({
        where: whereClause,
        include: {
          members: {
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
          },
          projects: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
          _count: {
            select: {
              members: true,
              projects: true,
              tasks: true,
            },
          },
        },
      });

      if (!team) {
        throw new NotFoundException('Team not found or access denied');
      }

      return {
        ...team,
        members: team.members,
        projects: team.projects,
      } as TeamResponseDto;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Error fetching team details: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new BadRequestException('Failed to fetch team details');
    }
  }

  async updateTeam(
    id: string,
    dto: UpdateTeamDto,
    user: UserPayload,
  ): Promise<TeamResponseDto> {
    const validatedDto = UpdateTeamSchema.parse(dto);

    this.logger.log(`Updating team: ${id}`);

    try {
      const team = await this.prisma.team.findFirst({
        where: {
          id,
          accountId: user.account.id,
        },
      });

      if (!team) {
        throw new NotFoundException('Team not found or access denied');
      }

      // Check permissions
      if (!this.hasTeamManagementPermission(user.role)) {
        throw new ForbiddenException(
          'You do not have permission to update this team',
        );
      }

      const updatedTeam = await this.prisma.team.update({
        where: { id },
        data: validatedDto,
        include: {
          members: {
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
          },
          projects: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
          _count: {
            select: {
              members: true,
              projects: true,
            },
          },
        },
      });

      this.logger.log(`Team updated successfully: ${id}`);

      return {
        ...updatedTeam,
        members: updatedTeam.members,
        projects: updatedTeam.projects,
      } as TeamResponseDto;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      this.logger.error(
        `Error updating team: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new BadRequestException('Failed to update team');
    }
  }

  async deleteTeam(id: string, user: UserPayload): Promise<void> {
    this.logger.log(`Deleting team: ${id}`);

    try {
      const team = await this.prisma.team.findFirst({
        where: {
          id,
          accountId: user.account.id,
        },
        include: {
          _count: {
            select: {
              projects: true,
              tasks: true,
            },
          },
        },
      });

      if (!team) {
        throw new NotFoundException('Team not found or access denied');
      }

      // Check permissions
      if (!this.hasTeamManagementPermission(user.role)) {
        throw new ForbiddenException(
          'You do not have permission to delete this team',
        );
      }

      // Warn if team has projects or tasks
      if (team._count.projects > 0) {
        throw new BadRequestException(
          'Cannot delete team with active projects. Remove projects first.',
        );
      }

      if (team._count.tasks > 0) {
        throw new BadRequestException(
          'Cannot delete team with active tasks. Remove tasks first.',
        );
      }

      await this.prisma.$transaction(async (tx) => {
        // Delete team members first (junction table)
        await tx.teamMember.deleteMany({
          where: { teamId: id },
        });

        // Delete user team links if any
        await tx.userTeamLink.deleteMany({
          where: { teamId: id },
        });

        // Delete the team
        await tx.team.delete({
          where: { id },
        });
      });

      this.logger.log(`Team deleted successfully: ${id}`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Error deleting team: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new BadRequestException('Failed to delete team');
    }
  }

  private hasTeamManagementPermission(role: UserRoleEnum): boolean {
    return ['admin', 'project_manager', 'owner'].includes(role);
  }
}
