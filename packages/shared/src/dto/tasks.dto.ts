import { z } from "zod";
import { Relations } from "../enumsTypes/relations.enum";
export const CreateTaskSchema = z.object({
  projectKey: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  assigneeId: z.string().uuid().optional(),
  creatorId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  projectId: z.string().uuid(),
  teamId: z.string().uuid().optional(),
  type: z
    .enum(["epic", "bug", "feature", "story", "subtask"])
    .default("subtask"),
  relatedTasks: z
    .array(
      z.object({
        taskId: z.string().uuid(),
        relationType: z.enum([
          Relations.BlockedBy,
          Relations.Blocking,
          Relations.ClonedFrom,
        ]),
      })
    )
    .optional(),
  status: z.enum(["todo", "in_progress", "done", "delivered"]),
});

export const UpateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done", "delivered"]).optional(),
  deliveryAddress: z.string().optional(),
  billableHours: z.number().optional(),
  storyPoints: z.number().optional(),
  deliveryWindow: z.string().optional(),
  asigneeId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.coerce.date().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  type: z.enum(["epic", "bug", "feature", "story", "subtask"]).optional(),
  teamId: z.string().uuid().optional(),
  relatedTasks: z
    .array(
      z.object({
        taskId: z.string().uuid(),
        relationType: z.enum(["cloned_from", "blocked_by", "blocking"]),
      })
    )
    .optional(),
});

export const TaskSchema = z.object({
  id: z.string().uuid(),
  projectKey: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  assigneeId: z.string().uuid().optional(),
  creatorId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  projectId: z.string().uuid(),
  teamId: z.string().uuid().optional(),
  type: z
    .enum(["epic", "bug", "feature", "story", "subtask"])
    .default("subtask"),
  relatedTasks: z
    .array(
      z.object({
        taskId: z.string().uuid(),
        relationType: z.enum(["cloned_from", "blocked_by", "blocking"]),
      })
    )
    .optional(),
  status: z.enum(["todo", "in_progress", "done", "delivered"]).optional(),
  deliveryAddress: z.string().optional(),
  billableHours: z.number().optional(),
  storyPoints: z.number().optional(),
  deliveryWindow: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const LogTaskStatusSchema = z.object({
  status: z.enum(["todo", "in_progress", "done", "delivered"]),
  location: z.string().optional(),
  updatedById: z.string().uuid().optional(),
});

export const UpdateLogTaskStatusSchema = z.object({
  status: z.enum(["todo", "in_progress", "done", "delivered"]),
  location: z.string().optional(),
  updatedById: z.string().uuid().optional(),
});
