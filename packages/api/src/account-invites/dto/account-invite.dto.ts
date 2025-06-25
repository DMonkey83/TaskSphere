import { createZodDto } from 'nestjs-zod';

import {
  InviteUserSchema,
  BulkInviteSchema,
  InviteQuerySchema,
} from '@shared/dto/account-invite.dto';

export class InviteUserDto extends createZodDto(InviteUserSchema) {}
export class BulkInviteDto extends createZodDto(BulkInviteSchema) {}
export class InviteQueryDto extends createZodDto(InviteQuerySchema) {}
