import { Module } from '@nestjs/common';

import { EmailModule } from 'src/email/email.module';
import { PrismaModule } from 'src/prisma/prisma.module';

import { AccountInvitesController } from './account-invites.controller';
import { AccountInvitesService } from './account-invites.service';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [AccountInvitesController],
  providers: [AccountInvitesService],
  exports: [AccountInvitesService],
})
export class AccountInvitesModule {}
