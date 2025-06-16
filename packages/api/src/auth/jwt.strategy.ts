import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';

import { AuthenticatedUser } from '@shared/dto/user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => {
        const cookies = req.cookies as Record<string, string> | undefined;
        const token = cookies?.['access_token'] || null;
        this.logger.log(`Cookies header: ${JSON.stringify(cookies)}`);
        this.logger.log(
          `Extracted access_token: ${token ? token.slice(0, 20) + '...' : 'undefined'}`,
        );
        if (!req.cookies) {
          this.logger.warn('req.cookies is undefined');
        }
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(payload: {
    userId: string;
    email: string;
    role: string;
    account: { id: string };
  }): Promise<AuthenticatedUser> {
    this.logger.log(`JWT Payload: ${JSON.stringify(payload)}`);
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!payload.userId || !uuidRegex.test(payload.userId)) {
      this.logger.error(`Invalid UUID in payload: ${payload.userId}`);
      throw new Error(`Invalid UUID: ${payload.userId}`);
    }
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      account: payload.account,
    };
  }
}
