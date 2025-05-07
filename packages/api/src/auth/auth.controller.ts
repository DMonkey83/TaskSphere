import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { LoginDto, LoginResponseDto, RegisterDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import { AccountsService } from '../accounts/accounts.service';

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
  ): Promise<LoginResponseDto> {
    const user: { id: string; email: string; role: string } | null =
      await this.authService.validateUser(body);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return this.authService.login(user);
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
