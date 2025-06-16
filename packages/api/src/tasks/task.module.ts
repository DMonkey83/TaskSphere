import { forwardRef, Module } from '@nestjs/common';

import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from './../users/users.module';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TaskActivityModule } from '../task-activities/task-activity.module';
import { TeamsModule } from '../teams/teams.module';

@Module({
  imports: [
    forwardRef(() => TaskActivityModule),
    PrismaModule,
    forwardRef(() => ProjectsModule),
    UsersModule,
    TeamsModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
