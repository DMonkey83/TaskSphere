import { createZodDto } from 'nestjs-zod';
import { SendNotificationSchema } from '@shared/dto/notifications.dto';

export class SendNotificationDto extends createZodDto(SendNotificationSchema) {}
