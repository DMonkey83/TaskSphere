import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SendNotificationDto } from './dto/notification.dto';
import { encrypt } from '../common/encryption.util';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    private configService: ConfigService,
  ) {}

  async send(dto: SendNotificationDto): Promise<Notification> {
    const encryptedContent = encrypt(
      dto.content,
      this.configService.get('ENCRYPTION_KEY'),
      null,
    );

    const notification = this.notificationsRepository.create({
      customer: { id: dto.customerId },
      task: { id: dto.taskId },
      type: dto.type,
      content: encryptedContent,
      status: 'pending',
    });

    return this.notificationsRepository.save(notification);
  }
}
