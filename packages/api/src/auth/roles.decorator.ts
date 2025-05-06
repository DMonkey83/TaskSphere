import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const PROJECT_ROLES_KEY = 'project_roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
export const ProjectRoles = (...roles: string[]) =>
  SetMetadata(PROJECT_ROLES_KEY, roles);
