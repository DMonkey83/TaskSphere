import {
  CreateTaskSchema,
  LogTaskStatusSchema,
  UpdateLogTaskStatusSchema,
  UpateTaskSchema,
} from '@shared/dto/tasks.dto';
import { createZodDto } from 'nestjs-zod';

export class CreateTaskDto extends createZodDto(CreateTaskSchema) {}
export class UpdateTaskDto extends createZodDto(UpateTaskSchema) {}
export class LogTaskStatusDto extends createZodDto(LogTaskStatusSchema) {}
export class UpdateLogTaskStatusDto extends createZodDto(
  UpdateLogTaskStatusSchema,
) {}
