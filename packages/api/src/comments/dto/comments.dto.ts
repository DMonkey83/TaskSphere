import { createZodDto } from 'nestjs-zod';

import { CreateCommentSchema } from '@shared/dto/comments.dto';

export class CreateCommentDto extends createZodDto(CreateCommentSchema) {}
