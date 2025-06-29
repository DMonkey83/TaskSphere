import {
  IndustriesZodEnum,
  WorkflowZodEnum,
  ProjectStatusZodEnum,
} from "../enumsTypes";
import { z } from "zod";
import { VisibilityZodEnum } from "../enumsTypes/visibility.enum";
import { AccountData, UserResponseSchema } from "./user.dto";
import { RiskLevelZodEnum } from "../enumsTypes/risk-level-enum";

export const StepDefinitionSchema = z.object({
  name: z.string(),
  status: z.string(),
});

// Schema for API requests (without accountId/ownerId - those come from auth)
export const CreateProjectRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  industry: IndustriesZodEnum.optional(),
  workflow: WorkflowZodEnum.optional().default("kanban"),
  matterNumber: z.string().optional(),
  visibility: VisibilityZodEnum.optional(),
  tags: z.array(z.string()).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// Schema for service layer (includes accountId/ownerId)
export const CreateProjectSchema = CreateProjectRequestSchema.partial().extend({
  accountId: z.string().uuid().nullish(),
  ownerId: z.string().uuid().nullish(),
  slug: z.string().optional(),
  budget: z.number().min(0).optional(),
  estimatedHours: z.number().min(0).optional(),
  riskLevel: RiskLevelZodEnum.optional(),
  clientApprovalRequired: z.boolean().optional(),
  template: z.boolean().optional(),
  sprintDuration: z.number().min(1).max(4).optional(),
  config: z.record(z.any()).optional(),
});

export const UpdateProjectRequestSchema =
  CreateProjectRequestSchema.partial().extend({
    id: z.string().uuid(),
    accountId: z.string().uuid().nullish(),
    ownerId: z.string().uuid().nullish(),
    budget: z.number().min(0).optional(),
    estimatedHours: z.number().min(0).optional(),
    riskLevel: RiskLevelZodEnum.optional(),
    clientApprovalRequired: z.boolean().optional(),
    template: z.boolean().optional(),
    sprintDuration: z.number().min(1).max(4).optional(),
  });

export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
  id: z.string().uuid(),
});

export const UpdateProjectStatusSchema = CreateProjectSchema.partial().extend({
  id: z.string().uuid(),
  status: ProjectStatusZodEnum,
});

export const CreateProjectViewSchema = z.object({
  viewType: WorkflowZodEnum,
  configuration: z.record(z.any()).optional(),
});

export const ProjectResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  account: AccountData,
  owner: UserResponseSchema.partial(),
  industry: IndustriesZodEnum.optional(),
  workflow: WorkflowZodEnum,
  matterNumber: z.string().optional(),
  slug: z.string().nullable(),
  visibility: VisibilityZodEnum.optional(),
  tags: z.array(z.string()).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  config: z.record(z.any()).optional(),
  projectKey: z.string(),
  status: ProjectStatusZodEnum.nullish().optional(),
  budget: z.number().or(z.string()).nullish().optional(),
  actualCost: z.number().nullish().optional(),
  estimatedHours: z.number().nullish().optional(),
  actualHours: z.number().nullish().optional(),
  riskLevel: RiskLevelZodEnum.nullish().optional(),
  clientApprovalRequired: z.boolean(),
  template: z.boolean(),
  createdAt: z.coerce.date(),
  archived: z.boolean(),
  updatedAt: z.coerce.date(),
  sprintDuration: z.number().nullish().optional(),
});

export const ProjectsListResponseSchema = z.object({
  projects: z.array(ProjectResponseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type CreateProjectRequest = z.infer<typeof CreateProjectRequestSchema>;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;
export type UpdateProjectRequest = z.infer<typeof UpdateProjectRequestSchema>;
export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;
export type ProjectsListResponse = z.infer<typeof ProjectsListResponseSchema>;
export type CreateProjectView = z.infer<typeof CreateProjectViewSchema>;
