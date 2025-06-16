import { Module } from '@nestjs/common';

import { ProjectsModule } from './../projects/projects.module';
import { TaskModule } from './../tasks/task.module';
import { UsersModule } from './../users/users.module';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ProjectsModule, TaskModule, UsersModule],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
