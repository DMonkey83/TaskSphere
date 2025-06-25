"use client";

import { useState, useMemo } from "react";
import { HiChartBar, HiPlus, HiCalendarDays } from "react-icons/hi2";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/store/user-store";

import { TaskResponse } from "@shared/dto/tasks.dto";
import { TeamsResponse } from "@shared/dto/team.dto";

import { TaskCard } from "./task-card";

interface SprintBoardProps {
  tasks: TaskResponse[];
  projectId: string;
  teams: TeamsResponse;
  user: User | null;
}

export function SprintBoard({ tasks }: SprintBoardProps) {
  const [activeSprintId, setActiveSprintId] = useState<string | null>(null);

  // Group tasks by sprint (using sprintId from tasks)
  const { sprintTasks, backlogTasks, sprints } = useMemo(() => {
    const sprintGroups: Record<string, TaskResponse[]> = {};
    const backlog: TaskResponse[] = [];
    const sprintIds = new Set<string>();

    tasks.forEach((task) => {
      if (task.sprintId) {
        sprintIds.add(task.sprintId);
        if (!sprintGroups[task.sprintId]) {
          sprintGroups[task.sprintId] = [];
        }
        sprintGroups[task.sprintId].push(task);
      } else {
        backlog.push(task);
      }
    });

    // Create mock sprint data (in real app, you'd fetch this from API)
    const mockSprints = Array.from(sprintIds).map((id) => ({
      id,
      name: `Sprint ${id.slice(-4)}`,
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "active" as const,
      goal: "Complete assigned tasks",
    }));

    return {
      sprintTasks: sprintGroups,
      backlogTasks: backlog,
      sprints: mockSprints,
    };
  }, [tasks]);

  const calculateSprintProgress = (sprintTasks: TaskResponse[]) => {
    if (sprintTasks.length === 0) return 0;
    const completed = sprintTasks.filter(
      (task) => task.status === "done" || task.status === "delivered"
    ).length;
    return Math.round((completed / sprintTasks.length) * 100);
  };

  const calculateStoryPoints = (sprintTasks: TaskResponse[]) => {
    return sprintTasks.reduce(
      (total, task) => total + (task.storyPoints || 0),
      0
    );
  };

  return (
    <div className="space-y-6">
      {/* Sprint Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HiChartBar className="w-4 h-4" />
              Active Sprints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sprints.length}</div>
            <p className="text-xs text-gray-500">Running sprints</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Story Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(sprintTasks).reduce(
                (total, tasks) => total + calculateStoryPoints(tasks),
                0
              )}
            </div>
            <p className="text-xs text-gray-500">Across all sprints</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Backlog Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backlogTasks.length}</div>
            <p className="text-xs text-gray-500">Unassigned tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Sprint Tabs */}
      <Tabs
        value={activeSprintId || "backlog"}
        onValueChange={setActiveSprintId}
      >
        <TabsList className="grid w-full grid-cols-auto">
          <TabsTrigger value="backlog">
            Backlog ({backlogTasks.length})
          </TabsTrigger>
          {sprints.map((sprint) => (
            <TabsTrigger key={sprint.id} value={sprint.id}>
              {sprint.name} ({sprintTasks[sprint.id]?.length || 0})
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Backlog Tab */}
        <TabsContent value="backlog" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Product Backlog
                  <Badge variant="secondary">{backlogTasks.length} items</Badge>
                </CardTitle>
                <Button size="sm">
                  <HiPlus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {backlogTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
              {backlogTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <HiChartBar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No tasks in backlog</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sprint Tabs */}
        {sprints.map((sprint) => (
          <TabsContent key={sprint.id} value={sprint.id} className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {sprint.name}
                      <Badge variant="outline">{sprint.status}</Badge>
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <HiCalendarDays className="w-4 h-4" />
                        <span>
                          {sprint.startDate.toLocaleDateString()} -{" "}
                          {sprint.endDate.toLocaleDateString()}
                        </span>
                      </div>
                      <div>Goal: {sprint.goal}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {calculateSprintProgress(sprintTasks[sprint.id] || [])}%
                    </div>
                    <p className="text-xs text-gray-500">Complete</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Sprint Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Sprint Progress</span>
                    <span>
                      {calculateStoryPoints(sprintTasks[sprint.id] || [])} story
                      points
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${calculateSprintProgress(
                          sprintTasks[sprint.id] || []
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Sprint Tasks */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(sprintTasks[sprint.id] || []).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>

                {!sprintTasks[sprint.id] && (
                  <div className="text-center py-8 text-gray-500">
                    <HiChartBar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No tasks assigned to this sprint</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
