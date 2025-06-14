import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OnBoardingModule } from 'src/onboarding/on-boarding.module';

import { Account } from './../accounts/entities/account.entity';
import { User } from './../users/entities/user.entity';
import { AccountInvitesController } from './account-invites.controller';
import { AccountInvitesService } from './account-invites.service';
import { AccountInvite } from './entities/account-invite.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountInvite, Account, User]),
    OnBoardingModule,
  ],
  controllers: [AccountInvitesController],
  providers: [AccountInvitesService],
  exports: [AccountInvitesService],
})
export class AccountInvitesModule {}
