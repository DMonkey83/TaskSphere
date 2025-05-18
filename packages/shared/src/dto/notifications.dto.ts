import { z } from 'zod';

export const SendNotificationSchema = z.object({
  customerId: z.string().uuid(),
  taskId: z.string().uuid(),
  type: z.enum(['email', 'sms']),
  content: z.string().min(1),
});
