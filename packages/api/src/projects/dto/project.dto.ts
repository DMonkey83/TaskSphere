import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateProjectDto = z.object({
  name: z.string().min(1),
  industry: z.enum(['programming', 'legal', 'logistics', 'other']).optional(),
  planningType: z.enum(['sprint', 'kanban', 'timeline', 'calendar']),
  accountId: z.string().uuid(),
  ownerId: z.string().uuid(),
  description: z.string().optional(),
  matterNumber: z.string().optional(),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1),
  industry: z.enum(['programming', 'legal', 'logistics', 'other']).optional(),
  planningType: z.enum(['sprint', 'kanban', 'timeline', 'calendar']).optional(),
  status: z.enum(['planned', 'in-progress', 'completed']),
  description: z.string().optional(),
  matterNumber: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const CreateProjectViewDto = z.object({
  viewType: z.enum(['list', 'kanban', 'timeline', 'calendar']),
  configuration: z.any().optional(),
});

export class CreateProjectDtoClass extends createZodDto(CreateProjectDto) {}
export class CreateProjectViewDtoClass extends createZodDto(
  CreateProjectViewDto,
) {}
export class UpdateProjectDtoClass extends createZodDto(UpdateProjectSchema) {}
