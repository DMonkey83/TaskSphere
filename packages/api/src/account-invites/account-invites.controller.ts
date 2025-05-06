import { Roles } from './../auth/roles.decorator';
import { RoleGuard } from './../auth/role.guard';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AccountInvitesService } from './account-invites.service';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from 'nestjs-zod';
import { CurrentUser } from '../auth/entities/current-user.decorator';
import { InviteUserDto } from './dto/account-invite.dto';

@Controller('account-invites')
export class AccountInvitesController {
  constructor(private readonly inviteService: AccountInvitesService) {}

  @Post('invite')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('owner', 'project_manager')
  async inviteUser(
    @Body(new ZodValidationPipe(InviteUserDto)) body: InviteUserDto,
    @CurrentUser() user: { userId: string; accountId: string },
  ) {
    console.log('user', user);
    return this.inviteService.createInvite(body.email, user.userId, body.role);
  }
}
