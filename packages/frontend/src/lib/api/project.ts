import {
  ProjectsListResponse,
  ProjectsListResponseSchema,
} from "@shared/dto/projects.dto";
import clientApi from "../axios";
import { z } from "zod";

export async function fetchProjectsClient(
  accountId: string
): Promise<ProjectsListResponse> {
  try {
    const response = await clientApi.get<ProjectsListResponse>(
      `/api/projects/${accountId}`
    );
    return ProjectsListResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "Validation error for /api/projects/account/:accountId:",
        error.errors
      );
      throw new Error("Invalid data structure received from server");
    }
    console.error("Error fetching projects data:", error);
    throw error;
  }
}
