import {
  Body,
  Controller,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { ZodValidationPipe } from 'nestjs-zod';

import { AuthService } from './auth.service';
import { CookieService, TokenCookieOptions } from './auth.utils';
import { LoginDto, LoginResponseDto } from './dto/auth.dto';
import { Public } from './public.decorator';
import { AccountsService } from '../accounts/accounts.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private authService: AuthService,
    private readonly accountService: AccountsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  async login(
    @Body(new ZodValidationPipe(LoginDto)) body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto | Error> {
    const user: User = await this.authService.validateUser(body);
    this.logger.log('User validated successfully', user.email);
    const tokens: TokenCookieOptions = await this.authService.login({
      id: user.id,
      email: user.email,
      role: user.role,
      account: { id: user.accountId },
      passwordHash: user.passwordHash, // Ensure passwordHash is included for validation
      firstLoginAt: user.firstLoginAt, // Include firstLoginAt for first-time login detection
    });
    CookieService.setAuthCookies(res, tokens);

    if (!user.id) {
      return Error(`User not found`);
    }

    const isFirstLogin = !user.firstLoginAt;

    const loginResponse: LoginResponseDto = {
      id: user.id,
      email: user.email,
      role: user.role,
      account: { id: user.accountId },
      isFirstLogin,
      firstLoginAt: user.firstLoginAt?.toISOString() || null,
    };

    return loginResponse;
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response): Promise<Response> {
    const refreshToken = req.cookies['refresh_token'] as string | undefined;
    if (!refreshToken)
      throw new UnauthorizedException('No refresh token provided');

    try {
      const { access_token, refresh_token: newRefreshToken } =
        await this.authService.refreshToken(refreshToken);

      this.logger.log(
        `Refreshing tokens for user with refresh token: ${newRefreshToken}, access token: ${access_token}`,
      );

      CookieService.setAuthCookies(res, {
        accessToken: access_token,
        refreshToken: newRefreshToken,
      });

      return res.json('New Refresh and access tokens created');
    } catch (error) {
      throw new UnauthorizedException(
        `Invalid or expired refresh token, ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
    }
  }

  @Post('register')
  async register(@Body() body: any) {
    console.log('body', body);

    // If accountName is provided, this is a regular registration
    if (body.accountName) {
      const account = await this.accountService.create({
        name: body.accountName,
      });

      const user = await this.usersService.create({
        email: body.email,
        passwordHash: body.password,
        role: 'owner',
        firstName: body.firstName,
        lastName: body.lastName,
        accountId: account.id,
      });
      return { account, user };
    } else {
      // This is an invite-based registration, create user without account assignment
      // The account will be assigned when the invite is accepted
      const user = await this.usersService.create({
        email: body.email,
        passwordHash: body.password,
        role: 'member', // Default role, will be updated when invite is accepted
        firstName: body.firstName,
        lastName: body.lastName,
        accountId: null, // Temporary, will be set when invite is accepted
      });
      return { user };
    }
  }
}
