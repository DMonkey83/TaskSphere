'use client';

import { ProjectProgress } from "@/components/dashboard/project-progress";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { TeamOverview } from "@/components/dashboard/team-overview";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { dashboardData } from "@/lib/dashboard-data";
import { accountStore } from "@/store/account-store";
import { RoleType, userStore } from "@/store/user-store";
import { useEffect } from "react";

interface ClientDashboardProps {
  user: { id: string; email: string; role: string; accountId: string };
  account: { name: string; industry: string };
}
export default function ClientDashboard({
  user,
  account,
}: ClientDashboardProps) {
  const { setUser } = userStore();
  const { setAccount } = accountStore();

  useEffect(() => {
    setUser({
      id: user.id,
      email: user.email,
      role: user.role as RoleType,
      accountId: user.accountId,
    });
    setAccount({
      name: account.name,
      industry: account.industry,
    });
  }, [user, account, setUser, setAccount]);

  return (
    <div className="space-y-6">
      <WelcomeSection />

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
