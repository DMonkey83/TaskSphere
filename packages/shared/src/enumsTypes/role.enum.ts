import { z } from "zod"
import { enumToOptions } from "../utils/enum-to-options"

export enum RoleEnum {
  Owner = 'owner',
  Admin = 'admin',
  ProjectManager = 'project_manager',
  Member = 'member',
  Viewer = 'viewer',
}

export const RoleLabels: Record<RoleEnum, string> = {
  [RoleEnum.Owner]: 'Owner',
  [RoleEnum.Admin]: 'Admin',
  [RoleEnum.ProjectManager]: 'Project Manager',
  [RoleEnum.Member]: 'Member',
  [RoleEnum.Viewer]: 'Viewer',
}

export const RoleZodEnum = z.enum(Object.values(RoleEnum) as [string, ...RoleEnum[]]);

export type Role = {
  label: keyof typeof RoleEnum;
  value: RoleEnum;
}

export const Roles = enumToOptions(RoleEnum) as Role[];
