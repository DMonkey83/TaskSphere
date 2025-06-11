import { z } from "zod";
import { RoleZodEnum } from "../enumsTypes";

export const CreateUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  accountId: z.string().uuid(),
  passwordHash: z.string().min(6),
  role: z.enum(["admin", "owner", "project_manager", "team_lead", "member"]),
});

export const RegisterFromInviteSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  token: z.string().uuid(),
  password: z.string().min(6, "Password must be atleast 6 characters long"),
  role: RoleZodEnum.optional(),
});

export const AccountData = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: RoleZodEnum,
  account: AccountData,
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  account: { id: string };
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
