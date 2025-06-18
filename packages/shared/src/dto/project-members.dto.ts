import { z } from 'zod';

export const AddProjectMemberSchema = z.object({
  userId: z.string().uuid(),
  projectId: z.string().uuid(),
  role: z.enum(['owner', 'admin', 'project_manager', 'member', 'viewer']).optional().default('member'),
});

export const RemoveProjectMemberSchema = z.object({
  userId: z.string().uuid(),
  projectId: z.string().uuid(),
});

export type AddProjectMember = z.infer<typeof AddProjectMemberSchema>;
export type RemoveProjectMember = z.infer<typeof RemoveProjectMemberSchema>;
