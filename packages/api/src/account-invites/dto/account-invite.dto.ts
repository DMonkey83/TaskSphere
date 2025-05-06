import { InviteUserSchema } from '@shared/dto/account-invite.dto';
import { createZodDto } from 'nestjs-zod';

export class InviteUserDto extends createZodDto(InviteUserSchema) {}
