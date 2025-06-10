import {
  CreateProject,
  ProjectResponse,
  ProjectsListResponse,
  ProjectsListResponseSchema,
} from "@shared/dto/projects.dto";
import clientApi from "../axios";
import { z } from "zod";
import { AxiosError } from "axios";

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

export const createProject = async (data: CreateProject): Promise<ProjectResponse> => {
  try {
    console.log("Creating project with data:", data);
    const response = await clientApi.post('/api/projects', data, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    })
    console.log('response')
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data ?? { message: 'Failed to Create Project' }
    throw new Error(JSON.stringify(errorData))
  }
}
