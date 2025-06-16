import { createZodDto } from 'nestjs-zod';
import { ZodType } from 'zod';

import {
  CreateTaskSchema,
  LogTaskStatusSchema,
  TaskSchema,
  UpateTaskSchema,
  UpdateLogTaskStatusSchema,
  TaskFilterSchema,
  TaskListResponseSchema,
} from '@shared/dto/tasks.dto';
export class CreateTaskDto extends createZodDto(CreateTaskSchema as ZodType) {}
export class UpdateTaskDto extends createZodDto(UpateTaskSchema as ZodType) {}
export class LogTaskStatusDto extends createZodDto(
  LogTaskStatusSchema as ZodType,
) {}
export class UpdateLogTaskStatusDto extends createZodDto(
  UpdateLogTaskStatusSchema as ZodType,
) {}
export class TaskDto extends createZodDto(TaskSchema as ZodType) {}
export class TaskFilterDto extends createZodDto(TaskFilterSchema as ZodType) {}
export class TaskListResponseDto extends createZodDto(
  TaskListResponseSchema as ZodType,
) {}
