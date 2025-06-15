import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from 'nestjs-zod';

import { RoleGuard } from './../auth/role.guard';
import { Roles } from './../auth/roles.decorator';
import { AccountInvitesService } from './account-invites.service';
import { InviteUserDto } from './dto/account-invite.dto';
import { AccountInvite } from '../../generated/prisma';
import { CurrentUser } from '../auth/entities/current-user.decorator';

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
    console.log('user', user);
    return this.inviteService.createInvite(body.email, user.userId, body.role);
  }
}
