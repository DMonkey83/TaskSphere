import { createZodDto } from 'nestjs-zod';
import { UploadDocumentSchema } from '@shared/dto/documents.dto';

export class UploadDocumentDto extends createZodDto(UploadDocumentSchema) {}
