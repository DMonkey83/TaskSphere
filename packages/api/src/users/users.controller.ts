import {
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from 'nestjs-zod';

import { AuthenticatedRequest } from '@shared/dto/user.dto';

import { CreateUserDto, RegisterFromInviteDto } from './dto/user.dto';
import { UsersService } from './users.service';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Post()
  create(@Body(new ZodValidationPipe(CreateUserDto)) body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Post('register-from-invite')
  async registerFromInvite(
    @Body(new ZodValidationPipe(RegisterFromInviteDto))
    body: RegisterFromInviteDto,
  ) {
    return this.usersService.registerFromInvite(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async findCurrentUser(@Request() req: AuthenticatedRequest): Promise<User> {
    const userId = req.user.userId;
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    return this.usersService.findById(userId);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @Get(':email')
  async findByEmail(@Param('email') email: string): Promise<User> {
    return this.usersService.findByEmail(email);
  }
}
