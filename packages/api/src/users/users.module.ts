import { Module } from '@nestjs/common';

import { OnBoardingModule } from '../onboarding/on-boarding.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AccountInvitesModule } from './../account-invites/account-invites.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule, AccountInvitesModule, OnBoardingModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
