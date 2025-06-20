import {
  useMutation,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

import {
  CreateTaskDto,
  TaskFilterDto,
  TaskListResponse,
  TaskResponse,
} from "@shared/dto/tasks.dto";

import { createTaskClient, fetchTasksClient } from "../api/task";

type TaskQueryKey = ["tasks", { accountId: string; filters?: Partial<TaskFilterDto> }];
export const useTasksQuery = (
  accountId: string,
  filters?: Partial<TaskFilterDto>,
  options?: Omit<
    UseQueryOptions<TaskListResponse, unknown, TaskListResponse, TaskQueryKey>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<TaskListResponse, unknown> => {
  return useQuery<TaskListResponse, unknown, TaskListResponse, TaskQueryKey>({
    queryKey: ["tasks", { accountId, filters }],
    queryFn: ({ queryKey }) => {
      const [, { filters: queryFilters }] = queryKey;
      return fetchTasksClient(queryFilters);
    },
    ...options,
  });
};

type ProjectTaskQueryKey = ["tasks", "project", { projectId: string; filters?: Partial<TaskFilterDto> }];
export const useProjectTasksQuery = (
  projectId: string,
  filters?: Partial<TaskFilterDto>,
  options?: Omit<
    UseQueryOptions<TaskListResponse, unknown, TaskListResponse, ProjectTaskQueryKey>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<TaskListResponse, unknown> => {
  const projectFilters = { ...filters, projectId };
  
  return useQuery<TaskListResponse, unknown, TaskListResponse, ProjectTaskQueryKey>({
    queryKey: ["tasks", "project", { projectId, filters }],
    queryFn: ({ queryKey }) => {
      const [, , { projectId: queryProjectId, filters: queryFilters }] = queryKey;
      const combinedFilters = { ...queryFilters, projectId: queryProjectId };
      return fetchTasksClient(combinedFilters);
    },
    enabled: !!projectId,
    ...options,
  });
};

export const useCreateTask = () => {
  return useMutation<TaskResponse, unknown, CreateTaskDto>({
    mutationFn: createTaskClient,
  });
};
