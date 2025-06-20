import { z } from "zod";

import clientApi from "../axios";

// Define the project member response type
const ProjectMemberSchema = z.object({
  id: z.string(),
  role: z.string(),
  joinedAt: z.coerce.date(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }),
});

const ProjectMembersResponseSchema = z.array(ProjectMemberSchema);

export type ProjectMember = z.infer<typeof ProjectMemberSchema>;
export type ProjectMembersResponse = z.infer<
  typeof ProjectMembersResponseSchema
>;

export async function fetchProjectMembers(
  projectId: string
): Promise<ProjectMembersResponse> {
  try {
    const response = await clientApi.get<ProjectMembersResponse>(
      `/api/project-members/project/${projectId}`
    );
    return ProjectMembersResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error for project members:", error.errors);
      throw new Error("Invalid data structure received from server");
    }
    console.error("Error fetching project members:", error);
    throw error;
  }
}
