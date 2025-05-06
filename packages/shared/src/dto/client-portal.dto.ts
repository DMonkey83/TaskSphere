import { z } from 'zod';
export const GrantAccessDto = z.object({
  customerId: z.string().uuid(),
  projectId: z.string().uuid(),
  role: z.enum(['viewer', 'collaborator']).optional(),
});
