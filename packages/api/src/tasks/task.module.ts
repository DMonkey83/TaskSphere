import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from './../users/users.module';
import { TaskStatusLog } from './entities/task-status-log';
import { Task } from './entities/task.entity';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskStatusLog]),
    ProjectsModule,
    UsersModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
