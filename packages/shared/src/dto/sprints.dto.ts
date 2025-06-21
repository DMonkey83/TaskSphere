import { z } from "zod";
import { UserResponseSchema } from "./user.dto";

export const SprintStatusZodEnum = z.enum([
  'planned',
  'active',
  'completed',
  'cancelled'
]);

export const CreateSprintSchema = z.object({
  name: z.string().min(1),
  goal: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  capacity: z.number().min(0).optional(),
  commitment: z.number().min(0).optional(),
  projectId: z.string().uuid(),
  ownerId: z.string().uuid().optional(),
});

export const UpdateSprintSchema = CreateSprintSchema.partial().extend({
  id: z.string().uuid(),
  status: SprintStatusZodEnum.optional(),
  velocity: z.number().min(0).optional(),
});

export const SprintResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  goal: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: SprintStatusZodEnum,
  capacity: z.number().optional(),
  commitment: z.number().optional(),
  velocity: z.number().optional(),
  projectId: z.string().uuid(),
  ownerId: z.string().uuid().optional(),
  owner: UserResponseSchema.partial().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  _count: z.object({
    tasks: z.number()
  }).optional(),
});

export const SprintsListResponseSchema = z.object({
  sprints: z.array(SprintResponseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type CreateSprint = z.infer<typeof CreateSprintSchema>;
export type UpdateSprint = z.infer<typeof UpdateSprintSchema>;
export type SprintResponse = z.infer<typeof SprintResponseSchema>;
export type SprintsListResponse = z.infer<typeof SprintsListResponseSchema>;