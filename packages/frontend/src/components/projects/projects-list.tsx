import Link from "next/link";
import {
  HiTrendingUp,
  HiBriefcase,
  HiEye,
  HiHashtag,
  HiTag,
  HiTrash,
  HiUsers,
} from "react-icons/hi";
import {
  HiArchiveBox,
  HiCalendarDays,
  HiEllipsisVertical,
} from "react-icons/hi2";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { projectStore } from "@/store/project-store";
import {
  formatDate,
  formatWorkflow,
  getDaysRemaining,
  getStatusIcon,
  getStatusVariant,
  getVisibilityIcon,
} from "@/utils/project-list-helpers";
import {
  calculateTaskProgress,
  calculateTimeProgress,
  getProgressFromStatus,
} from "@/utils/project-progress";

import { ProgressBar } from "./progress-bar";

export function ProjectsList() {
  const { projects, totalProjectCount: total } = projectStore();

  if (total === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <HiBriefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No projects found
          </h3>
          <p className="text-gray-500">
            Get started by creating your first project.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Projects</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {projects &&
            projects?.map((project) => {
              const timeProgress = calculateTimeProgress(
                project.startDate,
                project.endDate
              );
              const taskProgress = calculateTaskProgress(project.config);
              const statusProgress = getProgressFromStatus(project.status);

              // Debug logging for the specific project
              if (project.name === "Test Alises Poject") {
                console.log("Progress Debug for Test Alises Project:", {
                  startDate: project.startDate,
                  endDate: project.endDate,
                  status: project.status,
                  config: project.config,
                  timeProgress,
                  taskProgress,
                  statusProgress,
                });
              }
              const daysRemaining = getDaysRemaining(project.endDate);
              const isOverdue =
                daysRemaining !== null &&
                daysRemaining < 0 &&
                project.status !== "COMPLETED" &&
                project.status !== "completed";

              return (
                <div
                  key={project.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    project.archived ? "opacity-75" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3
                          className={`text-lg font-medium truncate ${
                            isOverdue ? "text-red-700" : "text-gray-900"
                          }`}
                        >
                          {project.name}
                        </h3>

                        <div className="flex items-center gap-2">
                          {getStatusIcon(project.status)}
                          <Badge variant={getStatusVariant(project.status)}>
                            {project.status.charAt(0).toUpperCase() +
                              project.status.slice(1).replace(/[_-]/g, " ")}
                          </Badge>

                          {project.archived && (
                            <Badge variant="outline">Archived</Badge>
                          )}

                          {isOverdue && (
                            <Badge variant="destructive">Overdue</Badge>
                          )}

                          {getVisibilityIcon(project.visibility)}
                        </div>
                      </div>

                      {project.description && (
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      {/* Progress Bars */}
                      <div className="mb-3 space-y-2">
                        {/* Prioritize Task Progress (actual work completion) over Time Progress */}
                        {taskProgress !== null ? (
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                                <HiTrendingUp className="w-3 h-3" />
                                Task Progress
                              </span>
                              <span className="text-xs text-gray-500">
                                {taskProgress}%
                              </span>
                            </div>
                            <ProgressBar
                              progress={taskProgress}
                              className="bg-green-500"
                            />
                          </div>
                        ) : timeProgress !== null ? (
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                                <HiCalendarDays className="w-3 h-3" />
                                Time Progress
                              </span>
                              <span className="text-xs text-gray-500">
                                {timeProgress}%
                              </span>
                            </div>
                            <ProgressBar
                              progress={timeProgress}
                              className={
                                isOverdue ? "bg-red-500" : "bg-blue-500"
                              }
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium text-gray-600">
                                Status Progress
                              </span>
                              <span className="text-xs text-gray-500">
                                {statusProgress}%
                              </span>
                            </div>
                            <ProgressBar
                              progress={statusProgress}
                              className="bg-gray-500"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <HiHashtag className="w-4 h-4" />
                          <span>{project.projectKey}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <HiBriefcase className="w-4 h-4" />
                          <span>{formatWorkflow(project.workflow)}</span>
                        </div>

                        {project.industry && (
                          <div className="flex items-center gap-1">
                            <HiTag className="w-4 h-4" />
                            <span>{project.industry}</span>
                          </div>
                        )}

                        {project.matterNumber && (
                          <div className="flex items-center gap-1">
                            <span>Matter: {project.matterNumber}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        {project.startDate && (
                          <div className="flex items-center gap-1">
                            <HiCalendarDays className="w-4 h-4" />
                            <span>Start: {formatDate(project.startDate)}</span>
                          </div>
                        )}

                        {project.endDate && (
                          <div className="flex items-center gap-1">
                            <HiCalendarDays className="w-4 h-4" />
                            <span
                              className={
                                isOverdue ? "text-red-600 font-medium" : ""
                              }
                            >
                              End: {formatDate(project.endDate)}
                              {daysRemaining !== null && (
                                <span className="ml-1">
                                  (
                                  {daysRemaining > 0
                                    ? `${daysRemaining}d left`
                                    : `${Math.abs(daysRemaining)}d overdue`}
                                  )
                                </span>
                              )}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <HiUsers className="w-4 h-4" />
                          <span>
                            Owner: {project.owner.firstName}{" "}
                            {project.owner.lastName}
                          </span>
                        </div>
                      </div>

                      {project.tags && project.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {project.tags.slice(0, 3).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {project.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="ml-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <HiEllipsisVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <HiEye className="w-4 h-4 mr-2" />
                            <Link href={`/projects/${project.slug}`}>
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <HiArchiveBox className="w-4 h-4 mr-2" />
                            {project.archived ? "Unarchive" : "Archive"} Project
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <HiTrash className="w-4 h-4 mr-2" />
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
