import { z } from "zod";

export const CreateProjectSchema = z.object({
  name: z.string().min(1),
  industry: z.enum(["programming", "legal", "logistics", "other"]).optional(),
  planningType: z.enum(["sprint", "kanban", "timeline", "calendar"]),
  accountId: z.string().uuid(),
  ownerId: z.string().uuid(),
  description: z.string().optional(),
  matterNumber: z.string().optional(),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1),
  industry: z.enum(["programming", "legal", "logistics", "other"]).optional(),
  planningType: z.enum(["sprint", "kanban", "timeline", "calendar"]).optional(),
  status: z.enum(["planned", "in-progress", "completed"]),
  description: z.string().optional(),
  matterNumber: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const CreateProjectViewSchema = z.object({
  viewType: z.enum(["list", "kanban", "timeline", "calendar"]),
  configuration: z.any().optional(),
});

export const ProjectResponseSchema = z.object({
  id: z.string().uuid().optional(),
  projectKey: z.string().optional(),
  name: z.string().optional(),
  industry: z.enum(["programming", "legal", "logistics", "other"]).optional(),
  planningType: z.enum(["sprint", "kanban", "timeline", "calendar"]).optional(),
  accountId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  description: z.string().optional(),
  matterNumber: z.string().or(z.null()).optional(),
  status: z.enum(["planned", "in-progress", "completed"]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const ProjectsListResponseSchema = z.array(ProjectResponseSchema);

export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;
export type ProjectsListResponse = z.infer<typeof ProjectsListResponseSchema>;
