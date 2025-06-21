import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AccountInvitesModule } from './account-invites/account-invites.module';
import { AccountsModule } from './accounts/accounts.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApprovalModule } from './approvals/approval.module';
import { AttachmentModule } from './attachments/attachment.module';
import { AuthModule } from './auth/auth.module';
import { RefreshTokenInterceptor } from './auth/refresh-token.interceptor';
import { CacheModule } from './cache/cache.module';
import { ClientPortalModule } from './client-portal/client-portal.module';
import { CommentModule } from './comments/comment.module';
import { CustomerModule } from './customers/customer.module';
import { DocumentModule } from './documents/document.module';
import { MilestoneModule } from './milestones/milestone.module';
import { NotificationModule } from './notifications/notification.module';
import { OnBoardingModule } from './onboarding/on-boarding.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectMemberModule } from './project-members/project-member.module';
import { ProjectsModule } from './projects/projects.module';
import { ReportModule } from './reports/report.module';
import { RoadmapModule } from './roadmaps/roadmap.module';
import { SprintModule } from './sprints/sprint.module';
import { TaskActivityModule } from './task-activities/task-activity.module';
import { TaskTagModule } from './task-tags/task-tag.module';
import { TaskModule } from './tasks/task.module';
import { TeamsModule } from './teams/teams.module';
import { TimeTrackingModule } from './time-trackings/time-tracking.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Core modules
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true, // Cache config for better performance
    }),
    PrismaModule, // Prisma handles database connection
    CacheModule, // Redis caching

    // Feature modules
    OnBoardingModule,
    TimeTrackingModule,
    TaskActivityModule,
    TaskTagModule,
    AttachmentModule,
    CommentModule,
    TeamsModule,
    AccountInvitesModule,
    ProjectMemberModule,
    NotificationModule,
    DocumentModule,
    ClientPortalModule,
    RoadmapModule,
    CustomerModule,
    TaskModule,
    ProjectsModule,
    MilestoneModule,
    SprintModule,
    ApprovalModule,
    ReportModule,
    UsersModule,
    AuthModule,
    AccountsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RefreshTokenInterceptor,
    },
  ],
})
export class AppModule {}
