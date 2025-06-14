import { useMemo } from "react";

import { projectStore } from "@/store/project-store";
import { DashboardStat } from "@/types/dashboard.types";

import { StatCard } from "./stat-card";

interface StatsOverviewProps {
  stats: DashboardStat[];
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const { totalProjectCount } = projectStore((state) => state);

  const updatedStats = useMemo(() => {
    console.log("project count was increased", totalProjectCount);
    return stats.map((stat, index) =>
      index === 0 ? { ...stat, value: totalProjectCount } : stat
    );
  }, [stats, totalProjectCount]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {updatedStats.map((stat, i) => (
        <StatCard key={i} stat={stat} />
      ))}
    </div>
  );
}
