import { randomUUID } from 'crypto';

import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountInvite,
  InviteRoleEnum,
  InviteStatusEnum,
  UserRoleEnum,
} from '@prisma/client';
import dayjs from 'dayjs';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AccountInvitesService {
  private readonly logger = new Logger(AccountInvitesService.name);
  constructor(private prisma: PrismaService) {}

  async createInvite(
    email: string,
    userId: string,
    role: InviteRoleEnum,
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

      const existringInvite = await this.prisma.accountInvite.findFirst({
        where: {
          email,
          accountId: user.accountId,
          accepted: false,
          expiresAt: {
            gte: new Date(),
          },
        },
      });
      if (existringInvite) {
        throw new BadRequestException(
          'An invite for this email already exists and is still valid.',
        );
      }
      if (!Object.values(UserRoleEnum).includes(role as UserRoleEnum)) {
        throw new BadRequestException('Invalid role provided');
      }

      const token = randomUUID();
      const invite = await this.prisma.accountInvite.create({
        data: {
          email,
          token,
          status: InviteStatusEnum.pending,
          role: role as UserRoleEnum,
          expiresAt: dayjs().add(7, 'days').toDate(),
          accountId: user.accountId,
        },
        include: { accounts: true },
      });

      this.logger.log(
        `Invite created for ${email} with role ${role} by user ${userId}`,
      );
      return invite;
    } catch (error) {
      this.logger.error(
        `Failed to create invite for ${email}`,
        (error as Error).message,
      );
      throw new BadRequestException(
        'Failed to create invite',
        (error as Error).message,
      );
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
      const invite = await this.prisma.accountInvite.update({
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
      return invite;
    } catch (error) {
      this.logger.error(
        `Failed to mark invite ${inviteId} as used`,
        (error as Error).message,
      );
      throw new BadRequestException(
        'Failed to mark invite as used',
        (error as Error).message,
      );
    }
  }

  async revokeInvite(inviteId: string): Promise<void> {
    try {
      await this.prisma.accountInvite.update({
        where: { id: inviteId },
        data: {
          status: InviteStatusEnum.revoked,
        },
      });
      this.logger.log(`Invite ${inviteId} has been revoked`);
    } catch (error) {
      if ((error as Error).message === 'RecordNotFound') {
        throw new NotFoundException('Invite not found');
      }
      throw error;
    }
  }
}
