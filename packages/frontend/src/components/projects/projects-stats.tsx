import {
  HiBriefcase,
  HiCheckCircle,
  HiClock,
  HiExclamationCircle,
  HiTrendingUp,
} from "react-icons/hi";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculateTimeProgress,
  calculateTaskProgress,
} from "@/utils/project-progress";

import { ProjectsListResponse } from "@shared/dto/projects.dto";

interface ProjectsStatsProps {
  projects: ProjectsListResponse;
}

export function ProjectsStats({ projects }: ProjectsStatsProps) {
  const totalProjects = projects?.total || 0;
  const activeProjects =
    projects.projects?.filter(
      (p) => p.status === "IN_PROGRESS" || p.status === "active"
    )?.length || 0;
  const completedProjects =
    projects.projects?.filter(
      (p) => p.status === "COMPLETED" || p.status === "completed"
    )?.length || 0;
  // const onHoldProjects =
  //   projects.projects?.filter(
  //     (p) => p.status === "ON_HOLD" || p.status === "on-hold"
  //   )?.length || 0;

  // Calculate average progress metrics
  const projectsWithTimeProgress =
    projects.projects
      ?.map((p) => calculateTimeProgress(p.startDate, p.endDate))
      .filter((p) => p !== null) || [];
  const avgTimeProgress =
    projectsWithTimeProgress.length > 0
      ? Math.round(
          projectsWithTimeProgress.reduce(
            (sum, progress) => sum + progress!,
            0
          ) / projectsWithTimeProgress.length
        )
      : 0;

  const projectsWithTaskProgress =
    projects.projects
      ?.map((p) => calculateTaskProgress(p.config))
      .filter((p) => p !== null) || [];
  const avgTaskProgress =
    projectsWithTaskProgress.length > 0
      ? Math.round(
          projectsWithTaskProgress.reduce(
            (sum, progress) => sum + progress!,
            0
          ) / projectsWithTaskProgress.length
        )
      : 0;

  // Count overdue projects
  const overdueProjects =
    projects.projects?.filter((p) => {
      if (!p.endDate || p.status === "COMPLETED" || p.status === "completed")
        return false;
      return new Date(p.endDate) < new Date();
    }).length || 0;

  const stats = [
    {
      title: "Total Projects",
      value: totalProjects,
      icon: HiBriefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Projects",
      value: activeProjects,
      icon: HiClock,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Completed",
      value: completedProjects,
      icon: HiCheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Overdue",
      value: overdueProjects,
      icon: HiExclamationCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  const progressStats = [
    {
      title: "Avg Time Progress",
      value: `${avgTimeProgress}%`,
      progress: avgTimeProgress,
      color: "bg-blue-500",
    },
    {
      title: "Avg Task Progress",
      value: `${avgTaskProgress}%`,
      progress: avgTaskProgress,
      color: "bg-green-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Overview */}
      {(projectsWithTimeProgress.length > 0 ||
        projectsWithTaskProgress.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HiTrendingUp className="w-5 h-5 text-gray-600" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {progressStats.map((stat, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {stat.title}
                    </span>
                    <span className="text-sm text-gray-600">{stat.value}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-3 ${stat.color} rounded-full transition-all duration-300 ease-out`}
                      style={{ width: `${stat.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
