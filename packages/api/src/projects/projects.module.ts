import { AccountsModule } from './../accounts/accounts.module';
import { Account } from './../accounts/entities/account.entity';
import { ProjectMember } from './../project-members/entities/project-member.entity';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { ProjectView } from './entities/project-view.entity';
import { Project } from './entities/project.entity';
import { ProjectController } from './project.controller';
import { ProjectsService } from './projects.service';
import { ProjectMemberModule } from '../project-members/project-member.module';

@Module({
  imports: [
    forwardRef(() => ProjectMemberModule),
    TypeOrmModule.forFeature([Project, ProjectView, ProjectMember, Account]),
    UsersModule,
    AccountsModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectsService],
  exports: [ProjectsService, TypeOrmModule],
})
export class ProjectsModule {}
