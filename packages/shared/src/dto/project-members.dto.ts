import { z } from 'zod';

export const AddProjectMemberSchema = z.object({
  userId: z.string().uuid(),
  projectId: z.string().uuid(),
  role: z.enum(['owner', 'project_manager', 'member']),
});

export const RemoverProjectMemberSchema = z.object({
  userId: z.string().uuid(),
  projectId: z.string().uuid(),
});
