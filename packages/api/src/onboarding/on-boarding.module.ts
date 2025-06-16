import { Module } from '@nestjs/common';

import { OnBoardingController } from './on-boarding.controller';
import { OnBoardingService } from './on-boarding.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OnBoardingController],
  providers: [OnBoardingService],
  exports: [OnBoardingService],
})
export class OnBoardingModule {}
