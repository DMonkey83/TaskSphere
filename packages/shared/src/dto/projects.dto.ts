import { z } from 'zod';

export const CreateProjectSchema = z.object({
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

export const CreateProjectViewSchema = z.object({
  viewType: z.enum(['list', 'kanban', 'timeline', 'calendar']),
  configuration: z.any().optional(),
});