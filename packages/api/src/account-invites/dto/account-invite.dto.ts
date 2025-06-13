import { createZodDto } from 'nestjs-zod';

import { InviteUserSchema } from '@shared/dto/account-invite.dto';

export class InviteUserDto extends createZodDto(InviteUserSchema) {}
