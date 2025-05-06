import { createZodDto } from 'nestjs-zod';
import { CreateAccountSchema } from '@shared/dto/account.dto';

export class CreateAccountDto extends createZodDto(CreateAccountSchema) {}
