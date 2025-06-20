import { useQuery } from "@tanstack/react-query";

import { fetchProjectMembers, ProjectMembersResponse } from "@/lib/api/project-members";

export function useProjectMembersQuery(projectId: string | undefined, options?: { enabled?: boolean }) {
  return useQuery<ProjectMembersResponse>({
    queryKey: ["project-members", projectId],
    queryFn: () => fetchProjectMembers(projectId!),
    enabled: !!projectId && (options?.enabled !== false),
  });
}