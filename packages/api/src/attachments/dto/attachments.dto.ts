import { AttachmentSchema } from '@shared/dto/attachments.dto';
import { createZodDto } from 'nestjs-zod';

export class AttachmentDto extends createZodDto(AttachmentSchema) {}
