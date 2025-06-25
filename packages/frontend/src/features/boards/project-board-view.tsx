"use client";

import { useState } from "react";
import {
  HiSquares2X2,
  HiCalendarDays,
  HiClock,
  HiChartBar,
} from "react-icons/hi2";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectBySlugQuery } from "@/lib/queries/useProjects";
import {
  useProjectTasksQuery,
  useTasksByProjectQuery,
} from "@/lib/queries/useTasks";
import { teamStore } from "@/store/team-store";
import { userStore } from "@/store/user-store";

import { CalendarView } from "./calendar-view";
import { KanbanBoard } from "./kanban-board";
import { SprintBoard } from "./sprint-board";
import { TimelineView } from "./timeline-view";

interface ProjectBoardViewProps {
  slug: string;
  view: string;
}

export function ProjectBoardView({ slug, view }: ProjectBoardViewProps) {
  const [activeView, setActiveView] = useState(view);

  // Use Zustand stores
  const user = userStore((state) => state.user);
  const teams = teamStore((state) => state.teams);

  const {
    data: projectDetails,
    isLoading: projectLoading,
    isError: projectError,
  } = useProjectBySlugQuery(slug, {
    enabled: !!slug && !!user?.accountId,
  });

  const {
    data: tasksData,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useTasksByProjectQuery(projectDetails?.id || "", {
    enabled: !!projectDetails?.id,
  });

  if (projectLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading project board...</p>
        </div>
      </div>
    );
  }

  if (projectError || tasksError) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-red-500">Error loading project board.</p>
        </CardContent>
      </Card>
    );
  }

  if (!projectDetails) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500">Project not found.</p>
        </CardContent>
      </Card>
    );
  }

  const tasks = tasksData?.tasks || [];

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {projectDetails.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{projectDetails.projectKey}</Badge>
            <Badge variant="secondary">
              {projectDetails.workflow.charAt(0).toUpperCase() +
                projectDetails.workflow.slice(1).replace(/[_-]/g, " ")}
            </Badge>
            <span className="text-sm text-gray-500">
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>
        </div>
      </div>

      {/* Board View Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <HiSquares2X2 className="w-4 h-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="sprint" className="flex items-center gap-2">
            <HiChartBar className="w-4 h-4" />
            Sprint
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <HiCalendarDays className="w-4 h-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <HiClock className="w-4 h-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-6">
          <KanbanBoard
            tasks={tasks}
            projectId={projectDetails.id}
            teams={teams}
            user={user}
          />
        </TabsContent>

        <TabsContent value="sprint" className="mt-6">
          <SprintBoard
            tasks={tasks}
            projectId={projectDetails.id}
            teams={teams}
            user={user}
          />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <CalendarView
            tasks={tasks}
            projectId={projectDetails.id}
            teams={teams}
            user={user}
          />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <TimelineView
            tasks={tasks}
            projectId={projectDetails.id}
            teams={teams}
            user={user}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
