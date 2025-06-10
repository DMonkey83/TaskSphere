import { ProjectsListResponse, CreateProject, ProjectResponse } from "@shared/dto/projects.dto";
import {
  useMutation,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { createProject, fetchProjectsClient } from "../api/project";

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

export const useCreateProject = () => {
  return useMutation<CreateProject, Error, ProjectResponse>({
    mutationFn: createProject,
  })
}
