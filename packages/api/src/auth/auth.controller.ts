import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { LoginDto, LoginResponseDto, RegisterDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import { AccountsService } from '../accounts/accounts.service';
import { Request, Response } from 'express';
import { CookieService, TokenCookieOptions } from './auth.utils';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly accountService: AccountsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  async login(
    @Body(new ZodValidationPipe(LoginDto)) body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const user: User = await this.authService.validateUser(body);
    const tokens: TokenCookieOptions = await this.authService.login({
      id: user.id,
      email: user.email,
      role: user.role as Role,
      account: { id: user.account.id },
      passwordHash: user.passwordHash, // Ensure passwordHash is included for validation
    });
    CookieService.setAuthCookies(res, tokens);

    const loginResponse: LoginResponseDto = {
      id: user.id,
      email: user.email,
      role: user.role,
      accountId: user.account.id,
    };

    return loginResponse;
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response): Promise<Response> {
    const cookies = req.cookies as { refresh_token?: string };
    const refreshToken = cookies.refresh_token;
    if (!refreshToken)
      throw new UnauthorizedException('No refresh token provided');

    try {
      const { access_token, refresh_token } =
        await this.authService.refreshToken(refreshToken);

      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.json('New Refresh and access tokens created');
    } catch (error) {
      throw new UnauthorizedException(
        `Invalid or expired refresh token, ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
    }
  }

  @Post('register')
  async register(@Body(new ZodValidationPipe(RegisterDto)) body: RegisterDto) {
    console.log('body', body);
    const account = await this.accountService.create({
      name: body.accountName,
      industry: body.industry,
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
  }
}
