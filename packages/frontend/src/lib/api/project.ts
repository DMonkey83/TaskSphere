import { AxiosError } from "axios";
import { z } from "zod";

import {
  CreateProjectRequest,
  ProjectResponse,
  ProjectResponseSchema,
  ProjectsListResponse,
  ProjectsListResponseSchema,
} from "@shared/dto/projects.dto";

import clientApi from "../axios";

export async function fetchProjectsClient(): Promise<ProjectsListResponse> {
  try {
    const response = await clientApi.get<ProjectsListResponse>(`/api/projects`);
    console.log("Fetched projects data:", response.data);
    return ProjectsListResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error for /api/projects/search", error.errors);
      throw new Error("Invalid data structure received from server");
    }
    console.error("Error fetching projects data:", error);
    throw error;
  }
}

export async function fetchProjectBySlugClient(
  slug: string
): Promise<ProjectResponse> {
  try {
    const response = await clientApi.get<ProjectResponse>(
      `/api/projects/slug/${slug}`
    );
    console.log("Fetched project by slug data:", response.data);
    return ProjectResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error for /api/projects/:slug", error.errors);
      throw new Error("Invalid data structure received from server");
    }
    console.error("Error fetching project data:", error);
    throw error;
  }
}

export const createProject = async (
  data: CreateProjectRequest
): Promise<ProjectResponse> => {
  try {
    console.log("Creating project with data:", data);
    const response = await clientApi.post("/api/projects", data, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });
    console.log("response");
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data ?? {
      message: "Failed to Create Project",
    };
    throw new Error(JSON.stringify(errorData));
  }
};
