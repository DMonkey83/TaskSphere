// dto/team.dto.ts
import { z } from "zod";

// Create Team DTO
export const CreateTeamSchema = z.object({
  name: z
    .string()
    .min(1, "Team name is required")
    .max(100, "Team name too long"),
  description: z.string().max(500, "Description too long").optional(),
  projectId: z.string().uuid("Invalid project ID").optional(),
  memberIds: z.array(z.string().uuid("Invalid member ID")).optional(),
});

export type CreateTeamDto = z.infer<typeof CreateTeamSchema>;

// Update Team DTO
export const UpdateTeamSchema = z.object({
  name: z
    .string()
    .min(1, "Team name is required")
    .max(100, "Team name too long")
    .optional(),
  description: z
    .string()
    .max(500, "Description too long")
    .nullable()
    .optional(),
});

export type UpdateTeamDto = z.infer<typeof UpdateTeamSchema>;

// Add Team Member DTO
export const AddTeamMemberSchema = z.object({
  teamId: z.string().uuid("Invalid team ID"),
  userId: z.string().uuid("Invalid user ID"),
});

export type AddTeamMemberDto = z.infer<typeof AddTeamMemberSchema>;

// Team Member Response
export const TeamMemberSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string(),
});

// Team Project Response
export const TeamProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});

// Team Response DTO (updated to match your schema)
export const TeamResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  accountId: z.string(),
  createdAt: z.date(),
  members: z.array(TeamMemberSchema),
  projects: z.array(TeamProjectSchema),
  _count: z.object({
    members: z.number(),
    projects: z.number(),
    tasks: z.number().optional(),
  }),
});
export const TeamsResponseSchema = z.array(TeamResponseSchema);

export type TeamResponse = z.infer<typeof TeamResponseSchema>;
export type TeamsResponse = z.infer<typeof TeamsResponseSchema>;

export type TeamResponseDto = z.infer<typeof TeamResponseSchema>;
export type TeamsResponseDto = z.infer<typeof TeamsResponseSchema>;
