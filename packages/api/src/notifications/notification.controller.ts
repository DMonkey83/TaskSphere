import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from 'nestjs-zod';

import { RoleGuard } from './../auth/role.guard';
import { NotificationService } from './notification.service';
import { Roles } from '../auth/roles.decorator';
import { SendNotificationDto } from './dto/notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'admin')
  @Post()
  create(
    @Body(new ZodValidationPipe(SendNotificationDto))
    body: SendNotificationDto,
  ) {
    return this.notificationService.send(body);
  }
}
