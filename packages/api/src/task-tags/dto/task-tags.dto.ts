import { CreateTaskTagSchema } from '@shared/dto/task-tags.dto';
import { createZodDto } from 'nestjs-zod';

export class CreateTaskTagDto extends createZodDto(CreateTaskTagSchema) {}
