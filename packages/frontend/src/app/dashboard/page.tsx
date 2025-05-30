import { dashboardData } from "@/lib/dashboard-data"
import { WelcomeSection } from "@/components/dashboard/welcome-section"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { ProjectProgress } from "@/components/dashboard/project-progress"
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { TeamOverview } from "@/components/dashboard/team-overview"

export default function DashboardPage() {
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
  )
}
