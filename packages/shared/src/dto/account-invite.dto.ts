import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const InviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['project_manager', 'member']),
});

export class InviteUserDto extends createZodDto(InviteUserSchema) {}
