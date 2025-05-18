import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from './../users/users.module';
import { TaskStatusLog } from './entities/task-status-log';
import { Task } from './entities/task.entity';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { Comment } from '../comments/entities/comments.entity';
import { Attachment } from '../attachments/entities/attachments.entity';
import { Tag } from '../task-tags/entities/task-tags.entity';
import { TaskActivity } from '../task-activities/entities/task-activities.entity';
import { TimeTracking } from '../time-trackings/entities/time-tracking.entity';
import { TaskActivityModule } from '../task-activities/task-activity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      TaskStatusLog,
      Comment,
      Attachment,
      Tag,
      TaskActivity,
      TimeTracking,
    ]),
    ProjectsModule,
    UsersModule,
    TaskActivityModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
