"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useState, useMemo } from "react";
import { createPortal } from "react-dom";


import { User } from "@/store/user-store";

import { TaskResponse } from "@shared/dto/tasks.dto";
import { TeamsResponse } from "@shared/dto/team.dto";


import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";

interface KanbanBoardProps {
  tasks: TaskResponse[];
  projectId: string;
  teams: TeamsResponse;
  user: User | null;
}

const KANBAN_COLUMNS = [
  { id: "todo", title: "To Do", status: "todo" },
  { id: "in_progress", title: "In Progress", status: "in_progress" },
  { id: "done", title: "Done", status: "done" },
  { id: "delivered", title: "Delivered", status: "delivered" },
] as const;

export function KanbanBoard({ tasks, projectId }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<TaskResponse | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped = KANBAN_COLUMNS.reduce((acc, column) => {
      acc[column.status] = tasks.filter(task => task.status === column.status);
      return acc;
    }, {} as Record<string, TaskResponse[]>);
    
    return grouped;
  }, [tasks]);

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    const overId = over.id;
    const overColumn = KANBAN_COLUMNS.find(col => col.id === overId);
    
    if (overColumn && activeTask.status !== overColumn.status) {
      // Here you would update the task status in your backend
      // For now, we'll just update the local state
      console.log(`Moving task ${activeTask.id} to ${overColumn.status}`);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    const overId = over.id;
    const overColumn = KANBAN_COLUMNS.find(col => col.id === overId);
    
    if (overColumn && activeTask.status !== overColumn.status) {
      // Here you would call your API to update the task status
      console.log(`Task ${activeTask.id} moved to ${overColumn.status}`);
      // Example API call:
      // updateTaskStatus(activeTask.id, overColumn.status);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasksByStatus[column.status] || []}
            projectId={projectId}
          />
        ))}
      </div>

      {/* Drag Overlay */}
      {createPortal(
        <DragOverlay>
          {activeTask && (
            <TaskCard
              task={activeTask}
              isDragging
            />
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}