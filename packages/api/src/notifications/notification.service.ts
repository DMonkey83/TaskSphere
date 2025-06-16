import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Notification, NotificationTypeEnum } from '@prisma/client';

import { NotificationStatusEnum } from '@shared/enumsTypes/notification-status.enum';

import { SendNotificationDto } from './dto/notification.dto';
import { encrypt } from '../common/encryption.util';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async send(dto: SendNotificationDto): Promise<Notification> {
    const encryptedContent = encrypt(
      dto.content,
      this.configService.get('ENCRYPTION_KEY'),
      null,
    );

    const notification = this.prisma.notification.create({
      data: {
        content: encryptedContent,
        type: dto.type as NotificationTypeEnum,
        customer: { connect: { id: dto.customerId } },
        task: dto.taskId ? { connect: { id: dto.taskId } } : null,
        status: NotificationStatusEnum.Pending,
      },
    });

    return notification;
  }
}
