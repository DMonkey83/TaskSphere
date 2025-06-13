import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Project } from './../projects/entities/project.entity';
import { ProjectsModule } from './../projects/projects.module';
import { UsersModule } from './../users/users.module';
import { ProjectMember } from './entities/project-member.entity';
import { ProjectMemberController } from './project-member.controller';
import { ProjectMemberService } from './project-member.service';

@Module({
  imports: [
    forwardRef(() => ProjectsModule),
    TypeOrmModule.forFeature([ProjectMember, Project]),
    UsersModule,
  ],
  controllers: [ProjectMemberController],
  providers: [ProjectMemberService],
  exports: [ProjectMemberService],
})
export class ProjectMemberModule {}
