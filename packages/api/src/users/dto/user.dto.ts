import { createZodDto } from 'nestjs-zod';

import {
  CreateUserSchema,
  RegisterFromInviteSchema,
  UserResponseSchema,
} from '@shared/dto/user.dto';

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
export class RegisterFromInviteDto extends createZodDto(
  RegisterFromInviteSchema,
) {}

export class UserResponseDto extends createZodDto(UserResponseSchema) {}
