import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerModule } from './../customers/customer.module';
import { ProjectsModule } from './../projects/projects.module';
import { ClientPortalController } from './client-portal.controller';
import { ClientPortalService } from './client-portal.service';
import { ClientPortalAccess } from './entities/client-portal-access.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientPortalAccess]),
    CustomerModule,
    ProjectsModule,
  ],
  controllers: [ClientPortalController],
  providers: [ClientPortalService],
  exports: [ClientPortalService],
})
export class ClientPortalModule {}
