import { createZodDto } from 'nestjs-zod';

import {
  CommentResponseSchema,
  CreateCommentSchema,
  UpdateCommentSchema,
} from '@shared/dto/comments.dto';

export class CreateCommentDto extends createZodDto(CreateCommentSchema) {}
export class CommentResponseDto extends createZodDto(CommentResponseSchema) {}
export class UpdateCommentDto extends createZodDto(UpdateCommentSchema) {}
