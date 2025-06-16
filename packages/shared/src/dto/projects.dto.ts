import {
  IndustriesZodEnum,
  WorkflowZodEnum,
  ProjectStatusZodEnum,
} from "../enumsTypes";
import { z } from "zod";
import { VisibilityZodEnum } from "../enumsTypes/visibility.enum";
import { AccountData, UserResponseSchema } from "./user.dto";

export const CreateProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  accountId: z.string().uuid(),
  ownerId: z.string().uuid(),
  industry: IndustriesZodEnum.optional(),
  workflow: WorkflowZodEnum,
  matterNumber: z.string().optional(),
  slug: z.string().optional(),
  visibility: VisibilityZodEnum.optional(),
  tags: z.array(z.string()).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  config: z.record(z.any()).optional(),
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
  status: ProjectStatusZodEnum,
  createdAt: z.coerce.date(),
  archived: z.boolean(),
  updatedAt: z.coerce.date(),
});

export const ProjectsListResponseSchema = z.object({
  projects: z.array(ProjectResponseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;
export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;
export type ProjectsListResponse = z.infer<typeof ProjectsListResponseSchema>;
export type CreateProjectView = z.infer<typeof CreateProjectViewSchema>;
