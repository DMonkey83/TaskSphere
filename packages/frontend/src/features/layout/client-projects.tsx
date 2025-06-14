"use client";

import {
  ProjectsList,
  ProjectsHeader,
  ProjectsFilters,
  ProjectsStats,
  CreateProjectButton,
} from "@/components/projects";
import { useSetupProjectsStores } from "@/hooks/useSetupProjectsStore";
import { useProjectsQuery } from "@/lib/queries/useProjects";
import { useUserQuery } from "@/lib/queries/useUser";

export default function ClientProjects() {
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useUserQuery();

  const accountId = user?.account?.id;

  const {
    data: projects,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useProjectsQuery(accountId!, {
    enabled: !!accountId,
  });

  useSetupProjectsStores({
    user,
    account: {
      name: user?.account?.name || "",
    },
    projects,
  });

  if (userLoading || projectsLoading) return <div>Loading...</div>;

  if (userError || projectsError) return <div>Error loading projects.</div>;

  return (
    <div className="space-y-6">
      <ProjectsHeader />
      <div className="flex justify-between items-center">
        <ProjectsFilters />
        <CreateProjectButton />
      </div>
      <ProjectsStats projects={projects} />
      <ProjectsList data={projects} />
    </div>
  );
}
