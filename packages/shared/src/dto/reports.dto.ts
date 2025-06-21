import { z } from "zod";
import { UserResponseSchema, AccountData } from "./user.dto";

export const ReportTypeZodEnum = z.enum([
  'project_summary',
  'task_performance',
  'time_tracking',
  'budget_analysis',
  'team_productivity',
  'milestone_progress',
  'sprint_report',
  'custom'
]);

export const CreateReportSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: ReportTypeZodEnum,
  config: z.record(z.any()),
  isPublic: z.boolean().default(false),
  accountId: z.string().uuid(),
  createdById: z.string().uuid(),
});

export const UpdateReportSchema = CreateReportSchema.partial().extend({
  id: z.string().uuid(),
});

export const ReportResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  type: ReportTypeZodEnum,
  config: z.record(z.any()),
  isPublic: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  accountId: z.string().uuid(),
  createdById: z.string().uuid(),
  account: AccountData.optional(),
  createdBy: UserResponseSchema.partial(),
});

export const ReportsListResponseSchema = z.object({
  reports: z.array(ReportResponseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type CreateReport = z.infer<typeof CreateReportSchema>;
export type UpdateReport = z.infer<typeof UpdateReportSchema>;
export type ReportResponse = z.infer<typeof ReportResponseSchema>;
export type ReportsListResponse = z.infer<typeof ReportsListResponseSchema>;