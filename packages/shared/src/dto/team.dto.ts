import { z } from 'zod';

export const TeamSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  projectId: z.string().uuid().optional(),
  memberIds: z.array(z.string().uuid()).optional(),
});
