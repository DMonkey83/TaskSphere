import {
  useMutation,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

import {
  ProjectsListResponse,
  CreateProject,
  ProjectResponse,
  UpdateProject,
} from "@shared/dto/projects.dto";
import { projectKeys } from "@shared/keys/project-keys";

import {
  createProject,
  fetchProjectBySlugClient,
  fetchProjectsClient,
  updateProject,
} from "../api/project";

type ProjectsQueryKey = ["projects", { accountId: string }];
type ProjectBySlugQueryKey = readonly ["projects", "slug", { slug: string }];

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
      const [] = queryKey;
      return fetchProjectsClient();
    },
    ...options,
  });
};

export const useProjectBySlugQuery = (
  slug: string,
  options?: Omit<
    UseQueryOptions<
      ProjectResponse,
      unknown,
      ProjectResponse,
      ProjectBySlugQueryKey
    >,
    "queryKey" | "queryFn"
  >
): UseQueryResult<ProjectResponse, unknown> => {
  return useQuery<
    ProjectResponse,
    unknown,
    ProjectResponse,
    ProjectBySlugQueryKey
  >({
    queryKey: projectKeys.bySlug(slug),
    queryFn: ({ queryKey }) => {
      const [, , { slug }] = queryKey;
      return fetchProjectBySlugClient(slug);
    },
    ...options,
  });
};

export const useCreateProject = () => {
  return useMutation<ProjectResponse, Error, CreateProject>({
    mutationFn: createProject,
  });
};

export const useUpdateProject = () => {
  return useMutation<ProjectResponse, Error, UpdateProject>({
    mutationFn: updateProject,
  });
};
