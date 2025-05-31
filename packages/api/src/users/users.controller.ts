import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateUserDto, RegisterFromInviteDto } from './dto/user.dto';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from 'nestjs-zod';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
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

  @Get(':id')
  async findById(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @Get(':email')
  async findByEmail(@Param('email') email: string): Promise<User> {
    return this.usersService.findByEmail(email);
  }
}
