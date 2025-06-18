import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { ProjectMemberService } from './../project-members/project-member.service';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requireRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    if (!requireRoles) return true;
    const request = context
      .switchToHttp()
      .getRequest<{ user: { role: string } }>();
    const user = request.user;
    return requireRoles.includes(user?.role);
  }
}

@Injectable()
export class ProjectRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly projectMemberService: ProjectMemberService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'project_roles',
      context.getHandler(),
    );
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest<{
      user: { id: string; role: string };
      params: { projectId?: string };
      body: { projectId?: string };
    }>();
    const user = request.user;
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'You do not have permission for this action',
      );
    }
    const projectId = request.params?.projectId || request.body?.projectId;

    if (!projectId) throw new ForbiddenException('No project ID provided');

    if (!this.projectMemberService) {
      throw new ForbiddenException('ProjectMemberService is not available');
    }
    const memberRole = await this.projectMemberService.getUserRoleInProject(
      user.id,
      projectId,
    );
    if (!memberRole || !requiredRoles.includes(memberRole)) {
      throw new ForbiddenException('Access denied for this project');
    }

    return true;
  }
}
