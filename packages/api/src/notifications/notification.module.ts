import { Module } from '@nestjs/common';

import { CustomerModule } from './../customers/customer.module';
import { TaskModule } from './../tasks/task.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, CustomerModule, TaskModule],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
