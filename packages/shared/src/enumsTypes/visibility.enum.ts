import { z } from "zod";
import { enumToOptions } from "../utils/enum-to-options";

export enum VisiblityEnum {
  Private = 'private',
  Team = 'team',
  Account = 'account',
}

export const VisiblityLabels: Record<VisiblityEnum, string> = {
  [VisiblityEnum.Private]: 'Private',
  [VisiblityEnum.Team]: 'Team',
  [VisiblityEnum.Account]: 'Account',
}

export const VisibilityZodEnum = z.enum(Object.values(VisiblityEnum) as [string, ...string[]]);

export type Visibility = {
  label: keyof typeof VisiblityEnum;
  value: VisiblityEnum;
}

export const Visibilities = enumToOptions(VisiblityEnum) as Visibility[];
