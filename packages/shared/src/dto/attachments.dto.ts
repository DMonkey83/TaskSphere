import { z } from 'zod';

export const AttachmentSchema = z.object({
  filename: z.string(),
  fileUrl: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  taskId: z.string().uuid(),
  uploadedById: z.string().uuid(),
});
