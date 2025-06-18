import { forwardRef, Module } from '@nestjs/common';

import { CacheModule } from '../cache/cache.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { AccountsModule } from './../accounts/accounts.module';
import { ProjectController } from './project.controller';
import { ProjectsService } from './projects.service';
import { ProjectKeyService } from './services/project-key.service';
import { ProjectSearchService } from './services/project-search.service';
import { ProjectStatsService } from './services/project-stats.service';
import { ProjectViewService } from './services/project-view.service';
import { ProjectMemberModule } from '../project-members/project-member.module';
import { TaskModule } from '../tasks/task.module';

@Module({
  imports: [
    forwardRef(() => ProjectMemberModule),
    forwardRef(() => TaskModule),
    PrismaModule,
    CacheModule,
    UsersModule,
    AccountsModule,
  ],
  controllers: [ProjectController],
  providers: [
    ProjectsService,
    ProjectKeyService,
    ProjectSearchService,
    ProjectViewService,
    ProjectStatsService,
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}
