import { z } from "zod";

import { enumToOptions } from "../utils/enum-to-options";

export enum TaskTypeEnum {
  Epic = "epic",
  Bug = "bug",
  Feature = "feature",
  Story = "story",
  Subtask = "subtask",
}

export const TaskTypeLabels: Record<TaskTypeEnum, string> = {
  [TaskTypeEnum.Epic]: "Epic",
  [TaskTypeEnum.Bug]: "Bug",
  [TaskTypeEnum.Feature]: "Feature",
  [TaskTypeEnum.Story]: "Story",
  [TaskTypeEnum.Subtask]: "Subtask",
};

export const TaskTypeZodEnum = z.enum(
  Object.values(TaskTypeEnum) as [string, ...string[]]
);

export type TaskType = {
  label: keyof typeof TaskTypeEnum;
  value: TaskTypeEnum;
};

export const TaskTypes = enumToOptions(TaskTypeEnum) as TaskType[];
