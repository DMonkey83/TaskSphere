import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export const RegisterSchema = z.object({
  accountName: z.string().min(1, 'Account name is required'),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  industry: z.enum(['programming', 'legal', 'logistics', 'other']).optional(),
});

export const LoginResponseSchema = z.object({
  access_token: z.string(),
});

export const RefreshTokenResponseDto = z.object({
  access_token: z.string(),
});

