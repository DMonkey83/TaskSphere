import { Module } from '@nestjs/common';

import { ClientPortalController } from './client-portal.controller';
import { ClientPortalService } from './client-portal.service';
import { CustomerModule } from '../customers/customer.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [PrismaModule, CustomerModule, ProjectsModule],
  controllers: [ClientPortalController],
  providers: [ClientPortalService],
  exports: [ClientPortalService],
})
export class ClientPortalModule {}
