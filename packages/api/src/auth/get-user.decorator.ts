import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { UserPayload } from './dto/auth.dto';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: UserPayload }>();
    console.log('Authenticated user:', request.user);

    return request.user;
  },
);
