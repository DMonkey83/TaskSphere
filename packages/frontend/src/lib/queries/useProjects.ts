import { ProjectsListResponse } from "@shared/dto/projects.dto";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { fetchProjectsClient } from "../api/project";

type ProjectsQueryKey = ["projects", { accountId: string }];

export const useProjectsQuery = (
  accountId: string,
  options?: Omit<
    UseQueryOptions<
      ProjectsListResponse,
      unknown,
      ProjectsListResponse,
      ProjectsQueryKey
    >,
    "queryKey" | "queryFn"
  >
): UseQueryResult<ProjectsListResponse, unknown> => {
  return useQuery<
    ProjectsListResponse,
    unknown,
    ProjectsListResponse,
    ProjectsQueryKey
  >({
    queryKey: ["projects", { accountId }],
    queryFn: ({ queryKey }) => {
      const [, { accountId }] = queryKey;
      return fetchProjectsClient(accountId);
    },
    ...options,
  });
};
