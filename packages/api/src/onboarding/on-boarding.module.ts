import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Onboarding } from './entities/onboardings.entity';
import { OnBoardingController } from './on-boarding.controller';
import { OnBoardingService } from './on-boarding.service';

@Module({
  imports: [TypeOrmModule.forFeature([Onboarding])],
  controllers: [OnBoardingController],
  providers: [OnBoardingService],
  exports: [OnBoardingService, TypeOrmModule],
})
export class OnBoardingModule {}
