import { z } from "zod";

export const InviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "admin", "project_manager", "member", "viewer"]),
});

export const BulkInviteItemSchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "admin", "project_manager", "member", "viewer"]),
});

export const BulkInviteSchema = z.object({
  invites: z.array(BulkInviteItemSchema).min(1).max(50),
});

export const InviteQuerySchema = z.object({
  status: z.enum(["pending", "accepted", "expired", "revoked"]).optional(),
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(10).optional(),
  email: z.string().optional(),
});
