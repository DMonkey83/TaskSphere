import { randomUUID } from 'crypto';

import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountInvite,
  InviteStatusEnum,
  UserRoleEnum,
  Prisma,
} from '@prisma/client';
import dayjs from 'dayjs';

import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AccountInvitesService {
  private readonly logger = new Logger(AccountInvitesService.name);
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async createInvite(
    email: string,
    userId: string,
    role: UserRoleEnum,
  ): Promise<AccountInvite> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          accountId: true,
          account: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!user?.accountId) throw new NotFoundException('User not found');

      const existingInvite = await this.prisma.accountInvite.findFirst({
        where: {
          email,
          accountId: user.accountId,
          accepted: false,
          expiresAt: {
            gte: new Date(),
          },
        },
      });
      if (existingInvite) {
        throw new BadRequestException(
          'An invite for this email already exists and is still valid.',
        );
      }
      if (!Object.values(UserRoleEnum).includes(role)) {
        throw new BadRequestException('Invalid role provided');
      }

      const token = randomUUID();
      const invite = await this.prisma.accountInvite.create({
        data: {
          email,
          token,
          status: InviteStatusEnum.pending,
          role: role,
          expiresAt: dayjs().add(7, 'days').toDate(),
          accountId: user.accountId,
        },
        include: { accounts: true },
      });

      this.logger.log(
        `Invite created for ${email} with role ${role} by user ${userId}`,
      );

      // Send invitation email
      await this.emailService.sendAccountInvite({
        email,
        inviterName: 'TaskSphere Team',
        accountName: user.account?.name || 'Unknown Account',
        inviteToken: token,
        role: role,
        expiresAt: invite.expiresAt,
      });

      return invite;
    } catch (error) {
      this.logger.error(
        `Failed to create invite for ${email}`,
        (error as Error).message,
      );
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to create invite');
    }
  }

  async validateInvite(token: string): Promise<AccountInvite> {
    if (!token) {
      throw new BadRequestException('Invite token is required');
    }

    const invite = await this.prisma.accountInvite.findFirst({
      where: {
        token,
        accepted: false,
        status: InviteStatusEnum.pending,
      },
      include: { accounts: true },
    });

    if (!invite) {
      throw new NotFoundException('Invite is invalid or expired');
    }
    if (invite.expiresAt < new Date()) {
      await this.prisma.accountInvite.update({
        where: { id: invite.id },
        data: { status: InviteStatusEnum.expired },
      });
      throw new BadRequestException('Invite has expired');
    }

    return invite;
  }

  async markInviteAsUsed(inviteId: string): Promise<AccountInvite> {
    try {
      const invite = await this.prisma.accountInvite.findUnique({
        where: { id: inviteId },
        include: { accounts: true },
      });

      if (!invite) {
        throw new NotFoundException('Invite not found');
      }

      if (invite.accepted) {
        throw new BadRequestException('Invite has already been accepted');
      }

      if (invite.expiresAt < new Date()) {
        throw new BadRequestException('Invite has expired');
      }

      // Find user by email and update their account assignment
      const user = await this.prisma.user.findUnique({
        where: { email: invite.email },
      });

      if (user) {
        // Update user's account and role
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            accountId: invite.accountId,
            role: invite.role,
          },
        });
      }

      const updatedInvite = await this.prisma.accountInvite.update({
        where: { id: inviteId },
        data: {
          accepted: true,
          status: InviteStatusEnum.accepted,
        },
        include: { accounts: true },
      });

      this.logger.log(
        `Invite ${inviteId} marked as used for email ${invite.email}`,
      );
      return updatedInvite;
    } catch (error) {
      this.logger.error(
        `Failed to mark invite ${inviteId} as used`,
        (error as Error).message,
      );
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to mark invite as used');
    }
  }

  async revokeInvite(inviteId: string, accountId?: string): Promise<void> {
    try {
      const whereClause: Prisma.AccountInviteWhereUniqueInput = {
        id: inviteId,
      };
      if (accountId) {
        const invite = await this.prisma.accountInvite.findUnique({
          where: { id: inviteId },
          select: { accountId: true },
        });
        if (!invite || invite.accountId !== accountId) {
          throw new NotFoundException('Invite not found');
        }
      }

      await this.prisma.accountInvite.update({
        where: whereClause,
        data: {
          status: InviteStatusEnum.revoked,
        },
      });
      this.logger.log(`Invite ${inviteId} has been revoked`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Invite not found');
      }
      this.logger.error(
        `Failed to revoke invite ${inviteId}`,
        (error as Error).message,
      );
      throw new BadRequestException('Failed to revoke invite');
    }
  }

  async getAccountInvites(
    accountId: string,
    query: {
      status?: InviteStatusEnum;
      page?: number;
      limit?: number;
      email?: string;
    },
  ) {
    try {
      const { status, page = 1, limit = 10, email } = query;
      const skip = (page - 1) * limit;

      const where: Prisma.AccountInviteWhereInput = {
        accountId,
        ...(status && { status }),
        ...(email && { email: { contains: email, mode: 'insensitive' } }),
      };

      const [invites, total] = await Promise.all([
        this.prisma.accountInvite.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: { accounts: true },
        }),
        this.prisma.accountInvite.count({ where }),
      ]);

      return {
        invites,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get account invites for ${accountId}`,
        (error as Error).message,
      );
      throw new BadRequestException('Failed to retrieve invites');
    }
  }

  async getInviteById(
    inviteId: string,
    accountId?: string,
  ): Promise<AccountInvite> {
    try {
      const where: Prisma.AccountInviteWhereInput = {
        id: inviteId,
        ...(accountId && { accountId }),
      };

      const invite = await this.prisma.accountInvite.findFirst({
        where,
        include: { accounts: true },
      });

      if (!invite) {
        throw new NotFoundException('Invite not found');
      }

      return invite;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to get invite ${inviteId}`,
        (error as Error).message,
      );
      throw new BadRequestException('Failed to retrieve invite');
    }
  }

  async resendInvite(
    inviteId: string,
    accountId: string,
  ): Promise<AccountInvite> {
    try {
      const invite = await this.prisma.accountInvite.findFirst({
        where: {
          id: inviteId,
          accountId,
          status: InviteStatusEnum.pending,
          accepted: false,
        },
        include: { accounts: true },
      });

      if (!invite) {
        throw new NotFoundException('Invite not found or already processed');
      }

      if (invite.expiresAt > new Date()) {
        throw new BadRequestException('Invite is still valid');
      }

      const updatedInvite = await this.prisma.accountInvite.update({
        where: { id: inviteId },
        data: {
          token: randomUUID(),
          expiresAt: dayjs().add(7, 'days').toDate(),
          status: InviteStatusEnum.pending,
        },
        include: { accounts: true },
      });

      // Send resent invitation email
      await this.emailService.sendInviteResent({
        email: invite.email,
        inviterName: 'TaskSphere Team',
        accountName: invite.accounts?.name || 'Unknown Account',
        inviteToken: updatedInvite.token,
        role: invite.role,
        expiresAt: updatedInvite.expiresAt,
      });

      this.logger.log(`Invite ${inviteId} has been resent`);
      return updatedInvite;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to resend invite ${inviteId}`,
        (error as Error).message,
      );
      throw new BadRequestException('Failed to resend invite');
    }
  }

  async bulkCreateInvites(
    invites: { email?: string; role?: UserRoleEnum }[],
    userId: string,
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          accountId: true,
          account: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!user?.accountId) throw new NotFoundException('User not found');

      const results = {
        successful: [] as AccountInvite[],
        failed: [] as { email: string; error: string }[],
      };

      for (const invite of invites) {
        try {
          if (!invite.email || !invite.role) {
            results.failed.push({
              email: invite.email || 'unknown',
              error: 'Email and role are required',
            });
            continue;
          }

          const existingInvite = await this.prisma.accountInvite.findFirst({
            where: {
              email: invite.email,
              accountId: user.accountId,
              accepted: false,
              expiresAt: { gte: new Date() },
            },
          });

          if (existingInvite) {
            results.failed.push({
              email: invite.email,
              error: 'Active invite already exists',
            });
            continue;
          }

          const token = randomUUID();
          const createdInvite = await this.prisma.accountInvite.create({
            data: {
              email: invite.email,
              token,
              status: InviteStatusEnum.pending,
              role: invite.role,
              expiresAt: dayjs().add(7, 'days').toDate(),
              accountId: user.accountId,
            },
            include: { accounts: true },
          });

          results.successful.push(createdInvite);

          // Send invitation email (don't fail bulk operation if email fails)
          await this.emailService.sendAccountInvite({
            email: invite.email,
            inviterName: 'TaskSphere Team',
            accountName: user.account?.name || 'Unknown Account',
            inviteToken: token,
            role: invite.role,
            expiresAt: createdInvite.expiresAt,
          });
        } catch (error) {
          results.failed.push({
            email: invite.email || 'unknown',
            error: (error as Error).message,
          });
        }
      }

      this.logger.log(
        `Bulk invite completed: ${results.successful.length} successful, ${results.failed.length} failed`,
      );

      return results;
    } catch (error) {
      this.logger.error(
        'Failed to process bulk invites',
        (error as Error).message,
      );
      throw new BadRequestException('Failed to process bulk invites');
    }
  }

  async cleanupExpiredInvites(): Promise<number> {
    try {
      const result = await this.prisma.accountInvite.updateMany({
        where: {
          expiresAt: { lt: new Date() },
          status: InviteStatusEnum.pending,
          accepted: false,
        },
        data: {
          status: InviteStatusEnum.expired,
        },
      });

      this.logger.log(`Cleaned up ${result.count} expired invites`);
      return result.count;
    } catch (error) {
      this.logger.error(
        'Failed to cleanup expired invites',
        (error as Error).message,
      );
      throw new BadRequestException('Failed to cleanup expired invites');
    }
  }
}
