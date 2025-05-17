import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comments.entity';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { UsersModule } from '../users/users.module';
import { TaskModule } from '../tasks/task.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Task, User]),
    UsersModule,
    TaskModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
