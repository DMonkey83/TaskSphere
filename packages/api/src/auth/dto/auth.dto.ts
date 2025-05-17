import { createZodDto } from 'nestjs-zod';
import {
  RegisterSchema,
  LoginSchema,
  LoginResponseSchema,
  RefreshTokenResponseSchema,
} from '@shared/dto/auth.dto';

export class LoginDto extends createZodDto(LoginSchema) {}
export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}
export class RegisterDto extends createZodDto(RegisterSchema) {}
export class RefreshTokenResponseDto extends createZodDto(
  RefreshTokenResponseSchema,
) {}
