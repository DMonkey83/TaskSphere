import { z } from "zod";

export const TaskStatusResponseSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(2).max(100),
  label: z.string().min(2).max(100),
  color: z.string().min(7).max(7).optional(),
  order: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
});

export type TaskStatusResponse = z.infer<typeof TaskStatusResponseSchema>;
