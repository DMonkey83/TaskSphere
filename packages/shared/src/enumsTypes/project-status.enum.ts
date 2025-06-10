import { enumToOptions } from "../utils/enum-to-options";
import { z } from "zod";

export enum ProjectStatusEnum {
  NotPlanned = 'not-planned',
  Planned = 'planned',
  InProgress = 'in-progress',
  Completed = 'completed',
}

export const ProjectStatusLabels: Record<ProjectStatusEnum, string> = {
  [ProjectStatusEnum.NotPlanned]: 'Not Planned',
  [ProjectStatusEnum.Planned]: 'Planned',
  [ProjectStatusEnum.InProgress]: 'In Progress',
  [ProjectStatusEnum.Completed]: 'Completed',
}

export const ProjectStatusZodEnum = z.enum(Object.values(ProjectStatusEnum) as [string, ...string[]]);

export type ProjectStatus = {
  label: keyof typeof ProjectStatusEnum;
  value: ProjectStatusEnum;
}

export const ProjectStatuses = enumToOptions(ProjectStatusEnum) as ProjectStatus[];
