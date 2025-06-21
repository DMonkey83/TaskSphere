import { z } from "zod";

import { Relations } from "../enumsTypes/relations.enum";
import { TaskTypeZodEnum } from "../enumsTypes/task-type.enum";

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
  dueDate: z.coerce.date().optional(),
  type: TaskTypeZodEnum.default("subtask"),
  estimatedHours: z.number().min(0).optional(),
  budget: z.number().min(0).optional(),
  riskLevel: z.enum(['low', 'medium', 'high']).optional(),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  template: z.boolean().optional(),
  blockedReason: z.string().optional(),
  milestoneId: z.string().uuid().optional(),
  sprintId: z.string().uuid().optional(),
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
  status: z.enum(["todo", "in_progress", "done", "delivered"]).default("todo"),
});

export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;

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
  type: TaskTypeZodEnum.optional(),
  teamId: z.string().uuid().optional(),
  estimatedHours: z.number().min(0).optional(),
  budget: z.number().min(0).optional(),
  riskLevel: z.enum(['low', 'medium', 'high']).optional(),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  template: z.boolean().optional(),
  blockedReason: z.string().optional(),
  milestoneId: z.string().uuid().optional(),
  sprintId: z.string().uuid().optional(),
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
  projectKey: z.string().nullish(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  assigneeId: z.string().uuid().nullish(),
  taskKey: z.string().nullish(),
  creatorId: z.string().uuid(),
  parentId: z.string().uuid().nullish(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  projectId: z.string().uuid(),
  teamId: z.string().uuid().nullish(),
  type: TaskTypeZodEnum.default("subtask"),
  relatedTasks: z
    .array(
      z.object({
        taskId: z.string().uuid(),
        relationType: z.enum(["cloned_from", "blocked_by", "blocking"]),
      })
    )
    .nullish(),
  status: z.string().nullish(),
  deliveryAddress: z.string().nullish(),
  billableHours: z.number().nullish(),
  storyPoints: z.number().nullish(),
  deliveryWindow: z.string().nullish(),
  dueDate: z.coerce.date().nullish(),
  createdAt: z.coerce.date().nullish(),
  updatedAt: z.coerce.date().nullish(),
});

export type TaskResponse = z.infer<typeof TaskSchema>;

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

// Task Query and Filtering Schemas
export const TaskFilterSchema = z.object({
  projectId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
  creatorId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  status: z.enum(["todo", "in_progress", "done", "delivered"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  type: TaskTypeZodEnum.optional(),
  search: z.string().optional(), // Search in title/description
  dueDateFrom: z.coerce.date().optional(),
  dueDateTo: z.coerce.date().optional(),
  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),
  hasParent: z.boolean().optional(), // Filter for tasks with/without parent
  isOverdue: z.boolean().optional(), // Filter for overdue tasks
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  sortBy: z
    .enum(["createdAt", "updatedAt", "dueDate", "priority", "title"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type TaskFilterDto = z.infer<typeof TaskFilterSchema>;

export const TaskListResponseSchema = z.object({
  tasks: z.array(TaskSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type TaskListResponse = z.infer<typeof TaskListResponseSchema>;
