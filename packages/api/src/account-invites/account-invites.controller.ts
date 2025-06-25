import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccountInvite } from '@prisma/client';
import { ZodValidationPipe } from 'nestjs-zod';

import { RoleGuard } from './../auth/role.guard';
import { Roles } from './../auth/roles.decorator';
import { AccountInvitesService } from './account-invites.service';
import {
  InviteUserDto,
  BulkInviteDto,
  InviteQueryDto,
} from './dto/account-invite.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('account-invites')
export class AccountInvitesController {
  constructor(private readonly inviteService: AccountInvitesService) {}

  @Post('invite')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('owner', 'project_manager')
  async inviteUser(
    @Body(new ZodValidationPipe(InviteUserDto)) body: InviteUserDto,
    @CurrentUser() user: { userId: string; accountId: string },
  ): Promise<AccountInvite> {
    return this.inviteService.createInvite(body.email, user.userId, body.role);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('owner', 'admin', 'project_manager')
  async getInvites(
    @Query(new ZodValidationPipe(InviteQueryDto)) query: InviteQueryDto,
    @CurrentUser() user: { userId: string; accountId: string },
  ) {
    return this.inviteService.getAccountInvites(user.accountId, query);
  }

  @Get('validate/:token')
  async validateInvite(@Param('token') token: string): Promise<AccountInvite> {
    return this.inviteService.validateInvite(token);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('owner', 'admin', 'project_manager')
  async getInvite(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; accountId: string },
  ): Promise<AccountInvite> {
    return this.inviteService.getInviteById(id, user.accountId);
  }

  @Post(':id/accept')
  async acceptInvite(@Param('id') id: string): Promise<AccountInvite> {
    return this.inviteService.markInviteAsUsed(id);
  }

  @Post(':id/resend')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('owner', 'admin', 'project_manager')
  async resendInvite(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; accountId: string },
  ): Promise<AccountInvite> {
    return this.inviteService.resendInvite(id, user.accountId);
  }

  @Post('bulk')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('owner', 'admin', 'project_manager')
  async bulkInvite(
    @Body(new ZodValidationPipe(BulkInviteDto)) body: BulkInviteDto,
    @CurrentUser() user: { userId: string; accountId: string },
  ) {
    return this.inviteService.bulkCreateInvites(body.invites, user.userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('owner', 'admin', 'project_manager')
  async revokeInvite(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; accountId: string },
  ): Promise<void> {
    return this.inviteService.revokeInvite(id, user.accountId);
  }
}
