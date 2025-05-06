import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const UploadDocumentDto = z.object({
  projectId: z.string().uuid(),
  fileName: z.string().min(1),
  filePath: z.string().min(1),
  uploadedById: z.string().uuid(),
  taskId: z.string().uuid().optional(),
});

export class UploadDocumentDtoClass extends createZodDto(UploadDocumentDto) {}
