import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const SendNotificationDto = z.object({
  customerId: z.string().uuid(),
  taskId: z.string().uuid(),
  type: z.enum(['email', 'sms']),
  content: z.string().min(1),
});

export class SendNotificationDtoClass extends createZodDto(
  SendNotificationDto,
) {}
