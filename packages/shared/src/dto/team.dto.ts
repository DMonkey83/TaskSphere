import { z } from "zod";
import { ProjectResponseSchema } from "./projects.dto";

export const TeamSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  projectId: z.string().uuid().optional(),
  memberIds: z.array(z.string().uuid()).optional(),
  accountId: z.string().uuid().optional(),
});

export const TeamsResponseSchema = z.array(
  z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string().optional(),
    project: ProjectResponseSchema.optional(),
    members: z.array(z.string().uuid()).optional(),
    accountId: z.string().uuid().optional(),
  })
);

export type TeamsResponse = z.infer<typeof TeamsResponseSchema>;
