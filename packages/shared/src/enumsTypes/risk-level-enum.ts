import { z } from "zod";
import { enumToOptions } from "../utils/enum-to-options";

export enum RiskLevelEnum {
  Low = "low",
  Medium = "medium",
  High = "high",
}

export const RiskLevelLabels: Record<RiskLevelEnum, string> = {
  [RiskLevelEnum.Low]: "Low",
  [RiskLevelEnum.Medium]: "Medium",
  [RiskLevelEnum.High]: "High",
};

export const RiskLevelZodEnum = z.enum(
  Object.values(RiskLevelEnum) as [string, ...string[]]
);

export type RiskLevel = {
  label: keyof typeof RiskLevelEnum;
  value: RiskLevelEnum;
};

export const RiskLevels = enumToOptions(RiskLevelEnum) as RiskLevel[];
