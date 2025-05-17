import { CreateCommentSchema } from '@shared/dto/comments.dto';
import { createZodDto } from 'nestjs-zod';

export class CreateCommentDto extends createZodDto(CreateCommentSchema) {}
