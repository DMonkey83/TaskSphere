"use client";

import {
  HiCalendarDays,
  HiHashtag,
  HiBriefcase,
  HiTag,
  HiUsers,
  HiCurrencyDollar,
  HiClock,
  HiPencil,
  HiArchiveBox,
  HiTrash,
  HiEllipsisVertical,
} from "react-icons/hi2";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProgressBar } from "@/components/projects/progress-bar";
import { ProjectsHeader } from "@/components/projects";
import { useSetupStores } from "@/hooks/useSetupStores";
import { useProjectBySlugQuery } from "@/lib/queries/useProjects";
import { useTeamsQuery } from "@/lib/queries/useTeams";
import { useUserQuery } from "@/lib/queries/useUser";
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

import { CreateProjectModal } from "../projects/create-project-modal";
import { HiTrendingUp } from "react-icons/hi";

export default function ClientProjectDetails({ slug }: { slug: string }) {
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useUserQuery();

  const accountId = user?.account?.id;

  const {
    data: projectDetails,
    isLoading: projectLoading,
    isError: projectError,
  } = useProjectBySlugQuery(slug!, {
    enabled: !!slug && !!accountId,
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
    teams,
  });

  if (userLoading || projectLoading || teamsLoading)
    return <div>Loading...</div>;

  if (userError || projectError || teamsError)
    return <div>Error loading projects.</div>;

  if (!projectDetails) {
    return (
      <div className="space-y-6">
        <ProjectsHeader />
        <Card>
          <CardContent className="text-center py-12">
            <HiBriefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Project not found
            </h3>
            <p className="text-gray-500">
              The project you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeProgress = calculateTimeProgress(
    projectDetails.startDate,
    projectDetails.endDate
  );
  const taskProgress = calculateTaskProgress(projectDetails.config);
  const statusProgress = getProgressFromStatus(projectDetails.status);
  const daysRemaining = getDaysRemaining(projectDetails.endDate);
  const isOverdue =
    daysRemaining !== null &&
    daysRemaining < 0 &&
    projectDetails.status !== "COMPLETED" &&
    projectDetails.status !== "completed";

  return (
    <div className="space-y-6">
      <ProjectsHeader />

      {/* Project Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1
                  className={`text-2xl font-bold ${
                    isOverdue ? "text-red-700" : "text-gray-900"
                  }`}
                >
                  {projectDetails.name}
                </h1>
                <div className="flex items-center gap-2">
                  {getStatusIcon(projectDetails.status)}
                  <Badge variant={getStatusVariant(projectDetails.status)}>
                    {projectDetails.status.charAt(0).toUpperCase() +
                      projectDetails.status.slice(1).replace(/[_-]/g, " ")}
                  </Badge>
                  {projectDetails.archived && (
                    <Badge variant="outline">Archived</Badge>
                  )}
                  {isOverdue && <Badge variant="destructive">Overdue</Badge>}
                  {getVisibilityIcon(projectDetails.visibility)}
                </div>
              </div>

              {projectDetails.description && (
                <p className="text-gray-600 mb-4">
                  {projectDetails.description}
                </p>
              )}

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <HiHashtag className="w-4 h-4" />
                  <span>{projectDetails.projectKey}</span>
                </div>
                <div className="flex items-center gap-1">
                  <HiBriefcase className="w-4 h-4" />
                  <span>{formatWorkflow(projectDetails.workflow)}</span>
                </div>
                {projectDetails.industry && (
                  <div className="flex items-center gap-1">
                    <HiTag className="w-4 h-4" />
                    <span>{projectDetails.industry}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <HiUsers className="w-4 h-4" />
                  <span>
                    Owner: {projectDetails.owner.firstName}{" "}
                    {projectDetails.owner.lastName}
                  </span>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <HiEllipsisVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <HiPencil className="w-4 h-4 mr-2" />
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HiArchiveBox className="w-4 h-4 mr-2" />
                  {projectDetails.archived ? "Unarchive" : "Archive"} Project
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <HiTrash className="w-4 h-4 mr-2" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Timeline Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HiCalendarDays className="w-4 h-4" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {projectDetails.startDate && (
                <div className="text-sm">
                  <span className="text-gray-500">Start:</span>
                  <span className="ml-2 font-medium">
                    {formatDate(projectDetails.startDate)}
                  </span>
                </div>
              )}
              {projectDetails.endDate && (
                <div className="text-sm">
                  <span className="text-gray-500">End:</span>
                  <span
                    className={`ml-2 font-medium ${
                      isOverdue ? "text-red-600" : ""
                    }`}
                  >
                    {formatDate(projectDetails.endDate)}
                    {daysRemaining !== null && (
                      <span className="block text-xs text-gray-500 mt-1">
                        {daysRemaining > 0
                          ? `${daysRemaining} days left`
                          : `${Math.abs(daysRemaining)} days overdue`}
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Budget Card */}
        {(projectDetails.budget || projectDetails.actualCost) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <HiCurrencyDollar className="w-4 h-4" />
                Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {projectDetails.budget && (
                  <div className="text-sm">
                    <span className="text-gray-500">Planned:</span>
                    <span className="ml-2 font-medium">
                      ${projectDetails.budget.toLocaleString()}
                    </span>
                  </div>
                )}
                {projectDetails.actualCost && (
                  <div className="text-sm">
                    <span className="text-gray-500">Actual:</span>
                    <span className="ml-2 font-medium">
                      ${projectDetails.actualCost.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hours Card */}
        {(projectDetails.estimatedHours || projectDetails.actualHours) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <HiClock className="w-4 h-4" />
                Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {projectDetails.estimatedHours && (
                  <div className="text-sm">
                    <span className="text-gray-500">Estimated:</span>
                    <span className="ml-2 font-medium">
                      {projectDetails.estimatedHours}h
                    </span>
                  </div>
                )}
                {projectDetails.actualHours && (
                  <div className="text-sm">
                    <span className="text-gray-500">Actual:</span>
                    <span className="ml-2 font-medium">
                      {projectDetails.actualHours}h
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HiTrendingUp className="w-4 h-4" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {taskProgress !== null ? (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Task Progress</span>
                  <span className="text-sm font-medium">{taskProgress}%</span>
                </div>
                <ProgressBar progress={taskProgress} className="bg-green-500" />
              </div>
            ) : timeProgress !== null ? (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Time Progress</span>
                  <span className="text-sm font-medium">{timeProgress}%</span>
                </div>
                <ProgressBar
                  progress={timeProgress}
                  className={isOverdue ? "bg-red-500" : "bg-blue-500"}
                />
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Status Progress</span>
                  <span className="text-sm font-medium">{statusProgress}%</span>
                </div>
                <ProgressBar
                  progress={statusProgress}
                  className="bg-gray-500"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tags */}
      {projectDetails.tags && projectDetails.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {projectDetails.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Created</h4>
                <p className="text-sm text-gray-600">
                  {formatDate(projectDetails.createdAt)}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Last Updated</h4>
                <p className="text-sm text-gray-600">
                  {formatDate(projectDetails.updatedAt)}
                </p>
              </div>
              {projectDetails.matterNumber && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Matter Number
                  </h4>
                  <p className="text-sm text-gray-600">
                    {projectDetails.matterNumber}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Account</h4>
                <p className="text-sm text-gray-600">
                  {projectDetails.account.name}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Visibility</h4>
                <p className="text-sm text-gray-600 capitalize">
                  {projectDetails.visibility.toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <CreateProjectModal />
        <Button variant="outline">
          <HiPencil className="w-4 h-4 mr-2" />
          Edit Project
        </Button>
      </div>
    </div>
  );
}
