import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OnBoardingModule } from 'src/onboarding/on-boarding.module';

import { AccountInvitesModule } from './../account-invites/account-invites.module';
import { AccountInvite } from './../account-invites/entities/account-invite.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AccountInvite]),
    AccountInvitesModule,
    OnBoardingModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
