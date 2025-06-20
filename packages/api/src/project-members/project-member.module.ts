import { forwardRef, Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './../auth/auth.module';
import { ProjectsModule } from './../projects/projects.module';
import { UsersModule } from './../users/users.module';
import { ProjectMemberController } from './project-member.controller';
import { ProjectMemberService } from './project-member.service';

@Module({
  imports: [
    forwardRef(() => ProjectsModule),
    PrismaModule,
    UsersModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [ProjectMemberController],
  providers: [ProjectMemberService],
  exports: [ProjectMemberService],
})
export class ProjectMemberModule {}
