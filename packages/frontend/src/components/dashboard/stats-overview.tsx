import { DashboardStat } from "@/types/dashboard.types"
import { StatCard } from "./stat-card"

interface StatsOverviewProps {
  stats: DashboardStat[]
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <StatCard key={i} stat={stat} />
      ))}
    </div>
  )
}
