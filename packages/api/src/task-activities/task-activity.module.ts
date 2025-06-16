import { forwardRef, Module } from '@nestjs/common';

import { TaskActivityController } from './task-activity.controller';
import { TaskActivityService } from './task-activity.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TaskModule } from '../tasks/task.module';
import { TeamsModule } from '../teams/teams.module';

@Module({
  imports: [PrismaModule, TeamsModule, forwardRef(() => TaskModule)],
  controllers: [TaskActivityController],
  providers: [TaskActivityService],
  exports: [TaskActivityService],
})
export class TaskActivityModule {}
