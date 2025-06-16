"use client";

import {
  ProjectProgress,
  RecentActivity,
  StatsOverview,
  TeamOverview,
  UpcomingDeadlines,
  WelcomeSection,
} from "@/components/dashboard";
import { useSetupStores } from "@/hooks/useSetupStores";
import { dashboardData } from "@/lib/dashboard-data";
import { useProjectsQuery } from "@/lib/queries/useProjects";
import { useTasksQuery } from "@/lib/queries/useTasks";
import { useTeamsQuery } from "@/lib/queries/useTeams";
import { useUserQuery } from "@/lib/queries/useUser";

export default function ClientDashboard({}) {
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useUserQuery();
  const accountId = user?.account?.id;
  const {
    data: teams,
    isLoading: teamsLoading,
    isError: teamsError,
  } = useTeamsQuery(accountId!, {
    enabled: !!accountId,
  });

  const {
    data: projects,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useProjectsQuery(accountId!, {
    enabled: !!accountId,
  });
  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useTasksQuery(accountId!, {
    enabled: !!accountId,
  });
  console.log("tasks", tasks);

  useSetupStores({
    user,
    account: {
      name: user?.account?.name || "",
    },
    teams,
    projects,
  });

  if (userLoading || teamsLoading || projectsLoading || tasksLoading)
    return <div>Loading...</div>;
  if (userError || teamsError || projectsError || tasksError)
    return <div>Error loading dashboard.</div>;

  return (
    <div className="space-y-6">
      <WelcomeSection name={`${user.firstName} ${user.lastName}`} />

      <StatsOverview stats={dashboardData.stats} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <ProjectProgress projects={dashboardData.recentProjects} />
        <UpcomingDeadlines deadlines={dashboardData.upcomingDeadlines} />
      </div>

      <RecentActivity activities={dashboardData.activities} />

      <TeamOverview />
    </div>
  );
}
