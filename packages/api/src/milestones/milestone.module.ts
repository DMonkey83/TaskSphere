import { Module } from '@nestjs/common';

import { MilestoneController } from './milestone.controller';
import { MilestoneService } from './milestone.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MilestoneController],
  providers: [MilestoneService],
  exports: [MilestoneService],
})
export class MilestoneModule {}
