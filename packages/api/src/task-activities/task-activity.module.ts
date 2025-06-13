import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TaskActivity } from './entities/task-activities.entity';
import { TaskActivityController } from './task-activity.controller';
import { TaskActivityService } from './task-activity.service';
import { Task } from '../tasks/entities/task.entity';
import { TaskModule } from '../tasks/task.module';
import { TeamsModule } from '../teams/teams.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskActivity, Task, User]),
    TeamsModule,
    forwardRef(() => TaskModule),
  ],
  controllers: [TaskActivityController],
  providers: [TaskActivityService],
  exports: [TaskActivityService],
})
export class TaskActivityModule {}
