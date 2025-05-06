import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const GrantAccessDto = z.object({
  customerId: z.string().uuid(),
  projectId: z.string().uuid(),
  role: z.enum(['viewer', 'collaborator']).optional(),
});

export class GrantAccessDtoClass extends createZodDto(GrantAccessDto) {}
