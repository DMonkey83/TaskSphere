import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { SendNotificationDto } from './dto/notification.dto';
import { encrypt } from '../common/encryption.util';
import { Notification } from './entities/notification.entity';
import { NotificationStatusEnum } from '../../../shared/src/enumsTypes/notification-status.enum';

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
      content: encryptedContent,
      type: dto.type,
      customerId: dto.customerId,
      taskId: dto.taskId,
      status: NotificationStatusEnum.Pending,
    } as DeepPartial<Notification>);

    return this.notificationsRepository.save(notification);
  }
}
