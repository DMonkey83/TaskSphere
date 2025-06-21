import { z } from "zod";
import { UserResponseSchema } from "./user.dto";

export const ApprovalTypeZodEnum = z.enum([
  'task_completion',
  'project_phase',
  'budget_change',
  'scope_change',
  'milestone'
]);

export const ApprovalStatusZodEnum = z.enum([
  'pending',
  'approved',
  'rejected',
  'cancelled'
]);

export const CreateApprovalSchema = z.object({
  type: ApprovalTypeZodEnum,
  comments: z.string().optional(),
  taskId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  requesterId: z.string().uuid(),
  reviewerId: z.string().uuid().optional(),
});

export const UpdateApprovalSchema = z.object({
  id: z.string().uuid(),
  status: ApprovalStatusZodEnum,
  comments: z.string().optional(),
  reviewerId: z.string().uuid().optional(),
});

export const ApprovalResponseSchema = z.object({
  id: z.string().uuid(),
  type: ApprovalTypeZodEnum,
  status: ApprovalStatusZodEnum,
  comments: z.string().optional(),
  requestedAt: z.coerce.date(),
  reviewedAt: z.coerce.date().optional(),
  taskId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  requesterId: z.string().uuid(),
  reviewerId: z.string().uuid().optional(),
  requester: UserResponseSchema.partial(),
  reviewer: UserResponseSchema.partial().optional(),
});

export const ApprovalsListResponseSchema = z.object({
  approvals: z.array(ApprovalResponseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type CreateApproval = z.infer<typeof CreateApprovalSchema>;
export type UpdateApproval = z.infer<typeof UpdateApprovalSchema>;
export type ApprovalResponse = z.infer<typeof ApprovalResponseSchema>;
export type ApprovalsListResponse = z.infer<typeof ApprovalsListResponseSchema>;