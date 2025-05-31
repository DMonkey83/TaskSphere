import { createZodDto } from 'nestjs-zod';
import {
  RegisterSchema,
  LoginSchema,
  LoginResponseSchema,
  RefreshTokenResponseSchema,
  ValidateUserSchema,
} from '@shared/dto/auth.dto';
import { Role } from '../../common/enums/role.enum';

export class LoginDto extends createZodDto(LoginSchema) {}
export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}
export class RegisterDto extends createZodDto(RegisterSchema) {}
export class RefreshTokenResponseDto extends createZodDto(
  RefreshTokenResponseSchema,
) {}
export class ValidateUserDto extends createZodDto(ValidateUserSchema) {}

export type UserPayload = {
  id: string;
  email: string;
  role: Role;
  account: { id: string };
};

export interface UserEntity {
  id: string;
  email: string;
  role: Role;
  passwordHash: string; // Changed from password
  account: { id: string };
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}
