import { createZodDto } from 'nestjs-zod';

import { AttachmentSchema } from '@shared/dto/attachments.dto';

export class AttachmentDto extends createZodDto(AttachmentSchema) {}
