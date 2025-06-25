"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { HiPlus } from "react-icons/hi2";


import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTaskModal } from "@/features/tasks/create-task-modal";

import { TaskResponse } from "@shared/dto/tasks.dto";

import { TaskCard } from "./task-card";

interface KanbanColumnProps {
  column: {
    id: string;
    title: string;
    status: string;
  };
  tasks: TaskResponse[];
  projectId: string;
}

const getColumnBadgeVariant = (status: string) => {
  switch (status) {
    case "todo":
      return "secondary";
    case "in_progress":
      return "default";
    case "done":
      return "outline";
    case "delivered":
      return "secondary";
    default:
      return "secondary";
  }
};

const getColumnColor = (status: string) => {
  switch (status) {
    case "todo":
      return "border-gray-200 bg-gray-50/50";
    case "in_progress":
      return "border-blue-200 bg-blue-50/50";
    case "done":
      return "border-green-200 bg-green-50/50";
    case "delivered":
      return "border-purple-200 bg-purple-50/50";
    default:
      return "border-gray-200 bg-gray-50/50";
  }
};

export function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const taskIds = tasks.map(task => task.id!);

  return (
    <Card 
      className={`h-fit min-h-[400px] transition-colors ${getColumnColor(column.status)} ${
        isOver ? "ring-2 ring-blue-500 ring-opacity-50" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {column.title}
            <Badge variant={getColumnBadgeVariant(column.status)} className="text-xs">
              {tasks.length}
            </Badge>
          </CardTitle>
          <CreateTaskModal
            trigger={
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <HiPlus className="h-3 w-3" />
              </Button>
            }
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div
          ref={setNodeRef}
          className="space-y-3 min-h-[300px]"
        >
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
              />
            ))}
          </SortableContext>
        </div>
      </CardContent>
    </Card>
  );
}