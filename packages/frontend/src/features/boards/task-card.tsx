"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { 
  HiCalendarDays, 
  HiChatBubbleLeft,
  HiPaperClip,
  HiFlag,
  HiClock
} from "react-icons/hi2";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { TaskResponse } from "@shared/dto/tasks.dto";

interface TaskCardProps {
  task: TaskResponse;
  isDragging?: boolean;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "text-red-600 bg-red-100";
    case "medium":
      return "text-yellow-600 bg-yellow-100";
    case "low":
      return "text-green-600 bg-green-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "epic":
      return "bg-purple-100 text-purple-800";
    case "story":
      return "bg-blue-100 text-blue-800";
    case "feature":
      return "bg-green-100 text-green-800";
    case "bug":
      return "bg-red-100 text-red-800";
    case "subtask":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function TaskCard({ task, isDragging }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id!,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCurrentlyDragging = isDragging || isSortableDragging;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
        isCurrentlyDragging 
          ? "opacity-50 shadow-lg rotate-1 scale-105" 
          : "opacity-100"
      }`}
    >
      <CardContent className="p-3 space-y-3">
        {/* Task Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {task.taskKey && (
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                  {task.taskKey}
                </span>
              )}
              <Badge 
                variant="secondary" 
                className={`text-xs ${getTypeColor(task.type || "subtask")}`}
              >
                {task.type || "subtask"}
              </Badge>
            </div>
            <h3 className="font-medium text-sm text-gray-900 line-clamp-2">
              {task.title || "Untitled Task"}
            </h3>
          </div>
          
          {task.priority && (
            <div className={`p-1 rounded-full ${getPriorityColor(task.priority)}`}>
              <HiFlag className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Task Description */}
        {task.description && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Task Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <HiCalendarDays className="w-3 h-3" />
                <span>{format(new Date(task.dueDate), "MMM d")}</span>
              </div>
            )}
            
            {task.assigneeId && (
              <div className="flex items-center gap-1">
                <Avatar className="w-4 h-4">
                  <AvatarFallback className="text-xs">
                    {/* You might want to get assignee details from a store or API */}
                    U
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {task.storyPoints && (
              <div className="flex items-center gap-1">
                <HiClock className="w-3 h-3" />
                <span>{task.storyPoints}sp</span>
              </div>
            )}
            
            {/* Placeholder for comments count - you'd get this from your API */}
            <div className="flex items-center gap-1">
              <HiChatBubbleLeft className="w-3 h-3" />
              <span>0</span>
            </div>
            
            {/* Placeholder for attachments count - you'd get this from your API */}
            <div className="flex items-center gap-1">
              <HiPaperClip className="w-3 h-3" />
              <span>0</span>
            </div>
          </div>
        </div>

        {/* Progress Bar for subtasks (if applicable) */}
        {task.parentId && (
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-blue-600 h-1 rounded-full" 
              style={{ width: "0%" }} // You'd calculate this based on subtask completion
            ></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}