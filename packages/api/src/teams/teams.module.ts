import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../projects/entities/project.entity';
import { UsersModule } from '../users/users.module';
import { Team } from './entities/team.entity';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';

@Module({
  imports: [TypeOrmModule.forFeature([Team, Project]), UsersModule],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService, TypeOrmModule],
})
export class TeamsModule {}
