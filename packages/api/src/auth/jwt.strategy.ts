import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => {
        const cookies = req.cookies as Record<string, string> | undefined;
        return cookies?.['acceess_token'] || null;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(payload: { id: string; email: string; role: string }) {
    return { userId: payload.id, email: payload.email, role: payload.role };
  }
}
