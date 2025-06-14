import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountInvitesModule } from './account-invites/account-invites.module';
import { AccountsModule } from './accounts/accounts.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AttachmentModule } from './attachments/attachment.module';
import { AuthModule } from './auth/auth.module';
import { RefreshTokenInterceptor } from './auth/refresh-token.interceptor';
import { ClientPortalModule } from './client-portal/client-portal.module';
import { CommentModule } from './comments/comment.module';
import { CustomerModule } from './customers/customer.module';
import { DocumentModule } from './documents/document.module';
import { NotificationModule } from './notifications/notification.module';
import { OnBoardingModule } from './onboarding/on-boarding.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectMemberModule } from './project-members/project-member.module';
import { ProjectsModule } from './projects/projects.module';
import { RoadmapModule } from './roadmaps/roadmap.module';
import { TaskActivityModule } from './task-activities/task-activity.module';
import { TaskTagModule } from './task-tags/task-tag.module';
import { TaskModule } from './tasks/task.module';
import { TeamsModule } from './teams/teams.module';
import { TimeTrackingModule } from './time-trackings/time-tracking.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
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
    UsersModule,
    AuthModule,
    AccountsModule,
    PrismaModule, // Add PrismaModule here
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: false,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
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
