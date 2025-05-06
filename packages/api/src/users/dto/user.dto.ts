import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateUserDto = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  accountId: z.string().uuid(),
  passwordHash: z.string().min(6),
  role: z.enum(['admin', 'owner', 'project_manager', 'team_lead', 'member']),
});

export const RegisterFromInviteSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  token: z.string().uuid(),
  password: z.string().min(6, 'Password must be atleast 6 characters long'),
  role: z.enum(['project_manager', 'member']).optional(),
});

export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(['admin', 'owner', 'project_manager', 'team_lead', 'member']),
  accountId: z.string().uuid(),
});

export class CreateUserDtoClass extends createZodDto(CreateUserDto) { }
export class RegisterFromInviteDto extends createZodDto(
  RegisterFromInviteSchema,
) { }

export class UserResponseDto extends createZodDto(UserResponseSchema) { }
