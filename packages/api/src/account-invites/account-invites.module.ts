import { User } from './../users/entities/user.entity';
import { Account } from './../accounts/entities/account.entity';
import { UsersService } from './../users/users.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountInvitesController } from './account-invites.controller';
import { AccountInvitesService } from './account-invites.service';
import { AccountInvite } from './entities/account-invite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccountInvite, Account, User])],
  controllers: [AccountInvitesController],
  providers: [AccountInvitesService, UsersService],
  exports: [AccountInvitesService],
})
export class AccountInvitesModule {}
