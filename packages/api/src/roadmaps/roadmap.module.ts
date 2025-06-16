import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { ProjectsModule } from './../projects/projects.module';
import { TaskModule } from './../tasks/task.module';
import { UsersModule } from './../users/users.module';
import { RoadmapController } from './roadmap.controller';
import { RoadmapService } from './roadmap.service';

@Module({
  imports: [PrismaModule, UsersModule, ProjectsModule, TaskModule],
  controllers: [RoadmapController],
  providers: [RoadmapService],
  exports: [RoadmapService],
})
export class RoadmapModule {}
