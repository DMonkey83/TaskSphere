import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export const RegisterSchema = z.object({
  accountName: z.string().min(1, "Account name is required"),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  industry: z.enum(["programming", "legal", "logistics", "other"]).optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type RegisterResponse = {
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  accountId: string;
};

export type LoginInput = z.infer<typeof LoginSchema>;
export type LoginResponse = {
  access_token: string;
  refresh_token: string;
};

export const LoginResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.string(),
});

export const RefreshTokenResponseDto = z.object({
  access_token: z.string(),
});
