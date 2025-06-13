import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { User } from './../../users/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: any }>();
    return request.user as User;
  },
);
