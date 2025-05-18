import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';
import { TaskActivityController } from './task-activity.controller';
import { TaskActivityService } from './task-activity.service';
import { TaskModule } from '../tasks/task.module';
import { TaskActivity } from './entities/task-activities.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskActivity, Task, User]),
    forwardRef(() => TaskModule),
  ],
  controllers: [TaskActivityController],
  providers: [TaskActivityService],
  exports: [TaskActivityService],
})
export class TaskActivityModule {}
