import { createZodDto } from 'nestjs-zod';
import {
  RegisterSchema,
  LoginSchema,
  LoginResponseSchema,
} from '@shared/dto/auth.dto';

export class LoginDto extends createZodDto(LoginSchema) {}
export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}
export class RegisterDto extends createZodDto(RegisterSchema) {}
