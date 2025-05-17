import { Body, Controller, Post } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/comments.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { CreateCommentSchema } from '@shared/dto/comments.dto';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(CreateCommentSchema)) dto: CreateCommentDto,
    @GetUser() user: User,
  ) {
    return this.commentService.createComment(dto, user);
  }
}
