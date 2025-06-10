import { IndustriesZodEnum, WorkflowZodEnum, ProjectStatusZodEnum } from "../enumsTypes";
import { z } from "zod";


export const CreateProjectSchema = z.object({
  name: z.string().min(1),
  industry: IndustriesZodEnum.optional(),
  workflow: WorkflowZodEnum,
  accountId: z.string().uuid(),
  ownerId: z.string().uuid(),
  description: z.string().optional(),
  matterNumber: z.string().optional(),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1),
  industry: IndustriesZodEnum.optional(),
  workflow: WorkflowZodEnum.optional(),
  status: ProjectStatusZodEnum.optional(),
  description: z.string().optional(),
  matterNumber: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const CreateProjectViewSchema = z.object({
  viewType: WorkflowZodEnum,
  configuration: z.any().optional(),
});

export const ProjectResponseSchema = z.object({
  id: z.string().uuid().optional(),
  projectKey: z.string().optional(),
  name: z.string().optional(),
  industry: IndustriesZodEnum.optional(),
  workflow: WorkflowZodEnum.optional(),
  accountId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  description: z.string().optional(),
  matterNumber: z.string().or(z.null()).optional(),
  status: ProjectStatusZodEnum.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const ProjectsListResponseSchema = z.array(ProjectResponseSchema);

export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;
export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;
export type ProjectsListResponse = z.infer<typeof ProjectsListResponseSchema>;
export type CreateProjectView = z.infer<typeof CreateProjectViewSchema>;


