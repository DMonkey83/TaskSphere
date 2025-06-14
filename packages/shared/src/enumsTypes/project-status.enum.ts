import { z } from "zod";
import { enumToOptions } from "../utils/enum-to-options";

export enum ProjectStatusEnum {
  Planned = "planned",
  InProgress = "in-progress",
  OnHold = "on-hold",
  NotStarted = "not-started",
  Completed = "completed",
  Cancelled = "cancelled",
}

export const ProjectStatusLabels: Record<ProjectStatusEnum, string> = {
  [ProjectStatusEnum.OnHold]: "On Hold",
  [ProjectStatusEnum.Planned]: "Planned",
  [ProjectStatusEnum.InProgress]: "In Progress",
  [ProjectStatusEnum.Completed]: "Completed",
  [ProjectStatusEnum.Cancelled]: "Cancelled",
  [ProjectStatusEnum.NotStarted]: "Not Started",
};

export const ProjectStatusZodEnum = z.enum(
  Object.values(ProjectStatusEnum) as [string, ...string[]]
);

export type ProjectStatus = {
  label: keyof typeof ProjectStatusEnum;
  value: ProjectStatusEnum;
};

export const ProjectStatuses = enumToOptions(
  ProjectStatusEnum
) as ProjectStatus[];
