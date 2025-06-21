import { z } from "zod";
import { UserResponseSchema } from "./user.dto";

export const MilestoneStatusZodEnum = z.enum([
  'planned',
  'in_progress', 
  'completed',
  'cancelled',
  'on_hold'
]);

export const CreateMilestoneSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  budget: z.number().min(0).optional(),
  projectId: z.string().uuid(),
  ownerId: z.string().uuid().optional(),
});

export const UpdateMilestoneSchema = CreateMilestoneSchema.partial().extend({
  id: z.string().uuid(),
  status: MilestoneStatusZodEnum.optional(),
  progress: z.number().min(0).max(100).optional(),
  actualCost: z.number().min(0).optional(),
});

export const MilestoneResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  status: MilestoneStatusZodEnum,
  progress: z.number(),
  priority: z.string(),
  budget: z.number().optional(),
  actualCost: z.number().optional(),
  projectId: z.string().uuid(),
  ownerId: z.string().uuid().optional(),
  owner: UserResponseSchema.partial().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  _count: z.object({
    tasks: z.number()
  }).optional(),
});

export const MilestonesListResponseSchema = z.object({
  milestones: z.array(MilestoneResponseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type CreateMilestone = z.infer<typeof CreateMilestoneSchema>;
export type UpdateMilestone = z.infer<typeof UpdateMilestoneSchema>;
export type MilestoneResponse = z.infer<typeof MilestoneResponseSchema>;
export type MilestonesListResponse = z.infer<typeof MilestonesListResponseSchema>;