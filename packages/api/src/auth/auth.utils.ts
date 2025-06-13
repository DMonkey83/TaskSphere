// packages/api/src/auth/auth.utils.ts
import { CookieOptions, Response } from 'express';

import { TokenResponse } from './dto/auth.dto';

export interface TokenCookieOptions {
  accessToken: string;
  refreshToken: string;
}

export class CookieService {
  private static readonly isProduction = process.env.NODE_ENV === 'production';

  public static getAccessTokenCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: true,
      sameSite: this.isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    };
  }

  public static getRefreshTokenCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: true,
      sameSite: this.isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
  }

  public static setAuthCookies(res: Response, tokens: TokenResponse): void {
    res.cookie(
      'access_token',
      tokens.accessToken,
      this.getAccessTokenCookieOptions(),
    );
    res.cookie(
      'refresh_token',
      tokens.refreshToken,
      this.getRefreshTokenCookieOptions(),
    );
  }
}
