import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comments.entity';
import { Task } from '../tasks/entities/task.entity';
import { CreateCommentDto } from './dto/comments.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async createComment(dto: CreateCommentDto, user: User): Promise<Comment> {
    const task = await this.taskRepository.findOneOrFail({
      where: { id: dto.taskId },
    });
    const comment = this.commentRepository.create({
      content: dto.content,
      task,
      author: user,
      parentComment: dto.parentCommentId
        ? await this.commentRepository.findOneOrFail({
            where: { id: dto.parentCommentId },
          })
        : null,
    });
    return this.commentRepository.save(comment);
  }
}
