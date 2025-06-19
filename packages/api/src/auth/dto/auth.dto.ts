import { UserRoleEnum } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';

import {
  RegisterSchema,
  LoginSchema,
  LoginResponseSchema,
  RefreshTokenResponseSchema,
  ValidateUserSchema,
} from '@shared/dto/auth.dto';

export class LoginDto extends createZodDto(LoginSchema) {}
export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}
export class RegisterDto extends createZodDto(RegisterSchema) {}
export class RefreshTokenResponseDto extends createZodDto(
  RefreshTokenResponseSchema,
) {}
export class ValidateUserDto extends createZodDto(ValidateUserSchema) {}

export type UserPayload = {
  userId: string;
  email: string;
  role: UserRoleEnum;
  account: { id: string };
  isFirstLogin?: boolean;
};

export interface UserEntity {
  id: string;
  email: string;
  role: UserRoleEnum;
  passwordHash: string; // Changed from password
  account: { id: string };
  firstLoginAt?: Date; // Optional, for first-time login detection
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}
