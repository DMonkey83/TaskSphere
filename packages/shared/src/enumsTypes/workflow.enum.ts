import { enumToOptions } from "../utils/enum-to-options";
import { z } from "zod";

export enum WorkflowEnum {
  Kanban = 'kanban',
  Scrum = 'scrum',
  Timeline = 'timeline',
  Calendar = 'calendar',
  Checklist = 'checklist',
}

export const WorkflowLabels: Record<WorkflowEnum, string> = {
  [WorkflowEnum.Kanban]: 'Kanban',
  [WorkflowEnum.Scrum]: 'Scrum Sprints',
  [WorkflowEnum.Timeline]: 'Timeline View',
  [WorkflowEnum.Calendar]: 'Calendar Schedule',
  [WorkflowEnum.Checklist]: 'Checklist',
}

export const WorkflowZodEnum = z.enum(Object.values(WorkflowEnum) as [string, ...string[]])

export type Workflow = {
  label: keyof typeof WorkflowEnum;
  value: WorkflowEnum;
}


export const Workflows = enumToOptions(WorkflowEnum) as Workflow[];
