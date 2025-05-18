import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';
import { TaskActivityController } from './task-activity.controller';
import { TaskActivityService } from './task-activity.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, User])],
  controllers: [TaskActivityController],
  providers: [TaskActivityService],
  exports: [TaskActivityService],
})
export class TaskActivityModule {}
