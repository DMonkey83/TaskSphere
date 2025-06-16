"use client";

import {
  ProjectsList,
  ProjectsHeader,
  ProjectsFilters,
  ProjectsStats,
} from "@/components/projects";
import { useSetupStores } from "@/hooks/useSetupStores";
import { useProjectsQuery } from "@/lib/queries/useProjects";
import { useTeamsQuery } from "@/lib/queries/useTeams";
import { useUserQuery } from "@/lib/queries/useUser";

import { CreateProjectModal } from "../projects/create-project-modal";

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

  const {
    data: teams,
    isLoading: teamsLoading,
    isError: teamsError,
  } = useTeamsQuery(accountId!, {
    enabled: !!accountId,
  });

  useSetupStores({
    user,
    account: {
      name: user?.account?.name || "",
    },
    projects,
    teams,
  });

  if (userLoading || projectsLoading || teamsLoading)
    return <div>Loading...</div>;

  if (userError || projectsError || teamsError)
    return <div>Error loading projects.</div>;

  return (
    <div className="space-y-6">
      <ProjectsHeader />
      <div className="flex justify-between items-center">
        <ProjectsFilters />
        <CreateProjectModal />
      </div>
      <ProjectsStats projects={projects} />
      <ProjectsList data={projects} />
    </div>
  );
}
