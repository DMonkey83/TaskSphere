import { z } from 'zod';

export const UploadDocumentSchema = z.object({
  projectId: z.string().uuid(),
  fileName: z.string().min(1),
  filePath: z.string().min(1),
  uploadedById: z.string().uuid(),
  taskId: z.string().uuid().optional(),
});
