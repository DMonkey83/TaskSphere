import { createZodDto } from 'nestjs-zod';

import { CreateTaskTagSchema } from '@shared/dto/task-tags.dto';

export class CreateTaskTagDto extends createZodDto(CreateTaskTagSchema) {}
