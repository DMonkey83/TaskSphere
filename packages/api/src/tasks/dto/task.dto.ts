import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateTaskSchema = z.object({
  projectKey: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  asigneeId: z.string().uuid().optional(),
  status: z.enum(['todo', 'in_progress', 'done', 'delivered']),
});

export const UpateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done', 'delivered']).optional(),
  deliveryAddress: z.string().optional(),
  billableHours: z.number().optional(),
  storyPoints: z.number().optional(),
  deliveryWindow: z.string().optional(),
  asigneeId: z.string().uuid().optional(),
  dueDate: z.coerce.date().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

export const LogTaskStatusSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'done', 'delivered']),
  location: z.string().optional(),
  updatedById: z.string().uuid().optional(),
});

export const UpdateLogTaskStatusSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'done', 'delivered']),
  location: z.string().optional(),
  updatedById: z.string().uuid().optional(),
});

export class CreateTaskDto extends createZodDto(CreateTaskSchema) {}
export class UpdateTaskDto extends createZodDto(UpateTaskSchema) {}
export class LogTaskStatusDto extends createZodDto(LogTaskStatusSchema) {}
export class UpdateLogTaskStatusDto extends createZodDto(
  UpdateLogTaskStatusSchema,
) {}
