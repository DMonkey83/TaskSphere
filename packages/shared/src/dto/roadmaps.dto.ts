import { z } from 'zod';

export const CreateRoadmapSchema = z.object({
  name: z.string().uuid(),
  ownerId: z.string().uuid(),
  description: z.string().optional(),
});

export const CreateRoadmapItemSchema = z.object({
  projectId: z.string().uuid(),
  taskId: z.string().uuid(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  dependencies: z.record(z.string(), z.any()).optional(),
});