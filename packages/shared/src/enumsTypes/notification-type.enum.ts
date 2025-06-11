import { z } from "zod"
import { enumToOptions } from "../utils/enum-to-options"

export enum NotificationTypeEnum {
  TaskAssigned = 'task_assigned',
  TaskUpdated = 'task_updated',
  TaskCommented = 'task_commented',
  TaskOverdue = 'task_overdue',
  TaskCompleted = 'task_completed',
  ProjectUpdated = 'project_updated',
}

export const NotifcationTypeLabels: Record<NotificationTypeEnum, string> = {
  [NotificationTypeEnum.TaskAssigned]: 'Task Assigned',
  [NotificationTypeEnum.TaskUpdated]: 'Task Updated',
  [NotificationTypeEnum.TaskCommented]: 'Task Commented',
  [NotificationTypeEnum.TaskOverdue]: 'Task Overdue',
  [NotificationTypeEnum.TaskCompleted]: 'Task Completed',
  [NotificationTypeEnum.ProjectUpdated]: 'Project Updated',
}

export const NotificationTypeZodEnum = z.enum(Object.values(NotificationTypeEnum) as [string, ...string[]]);

export type NotificationType = {
  label: keyof typeof NotificationTypeEnum;
  value: NotificationTypeEnum;
}

export const NotificationTypes = enumToOptions(NotificationTypeEnum) as NotificationType[];
