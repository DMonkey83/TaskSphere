import { z } from 'zod';
import { NotificationTypeZodEnum } from '../enumsTypes';

export const SendNotificationSchema = z.object({
  customerId: z.string().uuid(),
  taskId: z.string().uuid(),
  type: NotificationTypeZodEnum,
  content: z.string().min(1),
});
