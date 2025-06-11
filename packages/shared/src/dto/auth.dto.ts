import { z } from "zod";
import { IndustriesZodEnum } from "../enumsTypes";

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
});

export const LoginResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.string(),
  accountId: z.string().uuid(),
});

export const RefreshTokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});

export const ValidateUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.string(),
  account: z.object({ id: z.string() }),
  password: z.string(),
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
  accessToken: string;
  refreshToken: string;
};
