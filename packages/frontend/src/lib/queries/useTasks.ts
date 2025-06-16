import {
  useMutation,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

import {
  CreateTaskDto,
  TaskListResponse,
  TaskResponse,
} from "@shared/dto/tasks.dto";

import { createTaskClient, fetchTasksClient } from "../api/task";

type TaskQueryKey = ["tasks", { accountId: string }];
export const useTasksQuery = (
  accountId: string,
  options?: Omit<
    UseQueryOptions<TaskListResponse, unknown, TaskListResponse, TaskQueryKey>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<TaskListResponse, unknown> => {
  return useQuery<TaskListResponse, unknown, TaskListResponse, TaskQueryKey>({
    queryKey: ["tasks", { accountId }],
    queryFn: ({ queryKey }) => {
      const [] = queryKey;
      return fetchTasksClient();
    },
    ...options,
  });
};

export const useCreateTask = () => {
  return useMutation<TaskResponse, unknown, CreateTaskDto>({
    mutationFn: createTaskClient,
  });
};
