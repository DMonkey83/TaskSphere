"use client";

import {
  ProjectProgress,
  RecentActivity,
  StatsOverview,
  TeamOverview,
  UpcomingDeadlines,
  WelcomeSection,
} from "@/components/dashboard";
import { useTasksSetupStores } from "@/hooks/useSetupStores";
import { dashboardData } from "@/lib/dashboard-data";
import { useTasksQuery } from "@/lib/queries/useTasks";
import { userStore } from "@/store/user-store";

export default function ClientDashboard({}) {
  const user = userStore((state) => state.user);

  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useTasksQuery(user.accountId!, undefined, {
    enabled: !!user.accountId,
  });
  console.log("tasks", tasks);

  useTasksSetupStores({
    tasks,
  });

  if (tasksLoading) return <div>Loading...</div>;
  if (tasksError) return <div>Error loading dashboard.</div>;

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
