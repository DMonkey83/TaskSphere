// packages/api/src/auth/refresh-token.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Observable, throwError, lastValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from './auth.service';

@Injectable()
export class RefreshTokenInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RefreshTokenInterceptor.name);
  constructor(private readonly authService: AuthService) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();
    const refreshToken = request.cookies?.['refresh_token'] as
      | string
      | undefined;

    return next.handle().pipe(
      catchError(async (error) => {
        if ((error as { status?: number }).status === 401 && refreshToken) {
          try {
            this.logger.log(
              'refreshtokeninterceptor: intercepting request for refresh token after 401 error',
              error,
            );
            const { access_token, refresh_token } =
              await this.authService.refreshToken(refreshToken);
            response.cookie('access_token', access_token, {
              httpOnly: true,
              secure: true,
              sameSite: 'lax',
              maxAge: 15 * 60 * 1000, // 15 minutes
            });
            response.cookie('refresh_token', refresh_token, {
              httpOnly: true,
              secure: true,
              sameSite: 'lax',
              maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            request.cookies['access_token'] = access_token;
            const result: unknown = await lastValueFrom(next.handle());
            return result;
          } catch (refreshError) {
            response.clearCookie('access_token');
            response.clearCookie('refresh_token');
            return throwError(
              () =>
                new UnauthorizedException(
                  'Refresh token invalid',
                  refreshError,
                ),
            );
          }
        }
        return throwError(() => new Error(String(error)));
      }),
    );
  }
}
