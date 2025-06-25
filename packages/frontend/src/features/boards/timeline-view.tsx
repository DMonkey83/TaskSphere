"use client";

import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  differenceInDays,
} from "date-fns";
import { useState, useMemo } from "react";
import {
  HiChevronLeft,
  HiChevronRight,
  HiClock,
  HiCalendarDays,
} from "react-icons/hi2";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/store/user-store";

import { TaskResponse } from "@shared/dto/tasks.dto";
import { TeamsResponse } from "@shared/dto/team.dto";

interface TimelineViewProps {
  tasks: TaskResponse[];
  projectId: string;
  teams: TeamsResponse;
  user: User | null;
}

export function TimelineView({ tasks }: TimelineViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timelineScale, setTimelineScale] = useState<"months" | "weeks">(
    "months"
  );

  // Filter and sort tasks that have due dates
  const timelineTasks = useMemo(() => {
    return tasks
      .filter((task) => task.dueDate)
      .sort(
        (a, b) =>
          new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
      );
  }, [tasks]);

  // Calculate timeline range
  const timelineStart = startOfMonth(subMonths(currentDate, 2));
  const timelineEnd = endOfMonth(addMonths(currentDate, 4));
  const timelineMonths = eachMonthOfInterval({
    start: timelineStart,
    end: timelineEnd,
  });

  const navigateTimeline = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      if (direction === "prev") {
        return subMonths(prev, 1);
      } else {
        return addMonths(prev, 1);
      }
    });
  };

  const getTaskPosition = (task: TaskResponse) => {
    if (!task.dueDate) return { left: 0, width: 0 };

    const taskDate = new Date(task.dueDate);
    const totalDays = differenceInDays(timelineEnd, timelineStart);
    const daysFromStart = differenceInDays(taskDate, timelineStart);

    const leftPercentage = (daysFromStart / totalDays) * 100;

    return {
      left: Math.max(0, Math.min(100, leftPercentage)),
      width: 2, // Minimum width for visibility
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500 border-red-600";
      case "medium":
        return "bg-yellow-500 border-yellow-600";
      case "low":
        return "bg-green-500 border-green-600";
      default:
        return "bg-gray-500 border-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-gray-400";
      case "in_progress":
        return "bg-blue-500";
      case "done":
        return "bg-green-500";
      case "delivered":
        return "bg-purple-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HiClock className="w-5 h-5" />
              Project Timeline
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateTimeline("prev")}
              >
                <HiChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateTimeline("next")}
              >
                <HiChevronRight className="w-4 h-4" />
              </Button>
              <div className="border-l pl-2 ml-2">
                <Button
                  variant={timelineScale === "months" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setTimelineScale("months")}
                >
                  Months
                </Button>
                <Button
                  variant={timelineScale === "weeks" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setTimelineScale("weeks")}
                  className="ml-2"
                >
                  Weeks
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Timeline */}
      <Card>
        <CardContent className="p-0">
          {/* Timeline Header */}
          <div className="border-b bg-gray-50 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">
                {format(timelineStart, "MMM yyyy")} -{" "}
                {format(timelineEnd, "MMM yyyy")}
              </h3>
              <Badge variant="secondary">
                {timelineTasks.length} tasks with due dates
              </Badge>
            </div>

            {/* Month Labels */}
            <div className="relative h-8">
              <div className="flex justify-between">
                {timelineMonths.map((month) => (
                  <div key={month.toString()} className="flex-1 text-center">
                    <div className="text-sm font-medium">
                      {format(month, "MMM")}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(month, "yyyy")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline Content */}
          <div className="p-4">
            <div className="relative">
              {/* Timeline Grid */}
              <div className="absolute inset-0 flex">
                {timelineMonths.map((month, index) => (
                  <div
                    key={month.toString()}
                    className={`flex-1 border-r border-gray-200 ${
                      index === timelineMonths.length - 1 ? "border-r-0" : ""
                    }`}
                  />
                ))}
              </div>

              {/* Current Date Indicator */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10"
                style={{
                  left: `${
                    getTaskPosition({
                      dueDate: new Date().toISOString(),
                    } as unknown as TaskResponse).left
                  }%`,
                }}
              >
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
              </div>

              {/* Tasks */}
              <div className="relative space-y-3 pt-4">
                {timelineTasks.map((task) => {
                  const position = getTaskPosition(task);

                  return (
                    <div key={task.id} className="relative h-12 group">
                      {/* Task Bar */}
                      <div
                        className={`absolute h-6 rounded cursor-pointer transition-all hover:shadow-md ${getStatusColor(
                          task.status || "todo"
                        )} ${getPriorityColor(task.priority || "low")}`}
                        style={{
                          left: `${position.left}%`,
                          width: `${Math.max(position.width, 8)}%`,
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                        title={`${task.title} - Due: ${format(
                          new Date(task.dueDate!),
                          "MMM d, yyyy"
                        )}`}
                      >
                        {/* Task Content */}
                        <div className="flex items-center h-full px-2 text-white text-xs font-medium truncate">
                          {task.taskKey && (
                            <span className="mr-2 opacity-80">
                              {task.taskKey}
                            </span>
                          )}
                          <span className="truncate">{task.title}</span>
                        </div>
                      </div>

                      {/* Task Details on Hover */}
                      <div className="absolute left-0 top-8 z-20 hidden group-hover:block">
                        <div className="bg-white border rounded shadow-lg p-3 min-w-64">
                          <div className="font-medium text-sm mb-1">
                            {task.title}
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>
                              Due:{" "}
                              {format(new Date(task.dueDate!), "MMM d, yyyy")}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {task.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {task.priority}
                              </Badge>
                              <Badge variant="default" className="text-xs">
                                {task.status?.replace("_", " ")}
                              </Badge>
                            </div>
                            {task.description && (
                              <div className="text-xs">{task.description}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {timelineTasks.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <HiCalendarDays className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No tasks with due dates</p>
                  <p className="text-sm mt-1">
                    Add due dates to your tasks to see them on the timeline
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timelineTasks.length}</div>
            <p className="text-xs text-gray-500">With due dates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {
                timelineTasks.filter((task) => {
                  const taskDate = new Date(task.dueDate!);
                  return (
                    taskDate < new Date() &&
                    task.status !== "done" &&
                    task.status !== "delivered"
                  );
                }).length
              }
            </div>
            <p className="text-xs text-gray-500">Past due date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {
                timelineTasks.filter((task) => {
                  const taskDate = new Date(task.dueDate!);
                  const weekFromNow = new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000
                  );
                  return taskDate <= weekFromNow && taskDate >= new Date();
                }).length
              }
            </div>
            <p className="text-xs text-gray-500">Due this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {
                timelineTasks.filter(
                  (task) =>
                    task.status === "done" || task.status === "delivered"
                ).length
              }
            </div>
            <p className="text-xs text-gray-500">Finished tasks</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
