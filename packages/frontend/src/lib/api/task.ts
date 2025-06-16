import { AxiosError } from "axios";

import {
  CreateTaskDto,
  TaskListResponse,
  TaskListResponseSchema,
  TaskResponse,
} from "@shared/dto/tasks.dto";

import clientApi from "../axios";

export async function fetchTasksClient(): Promise<TaskListResponse> {
  try {
    const response = await clientApi.get<TaskListResponse>(`/api/tasks`);
    console.log("Fetched tasks data:", response.data);
    return TaskListResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error fetching tasks data:", error.response?.data);
      throw new Error(error.response?.data?.message || "Failed to fetch tasks");
    } else {
      console.error("Unexpected error fetching tasks data:", error);
      throw new Error("An unexpected error occurred while fetching tasks");
    }
  }
}

export async function createTaskClient(
  data: CreateTaskDto
): Promise<TaskResponse> {
  try {
    console.log("Creating task with data:", data);
    const response = await clientApi.post<TaskResponse>("/api/tasks", data, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });
    console.log("Task created successfully:", response.data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data ?? {
      message: "Failed to create task",
    };
    console.error("Error creating task:", errorData);
    throw new Error(JSON.stringify(errorData));
  }
}
