import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from './../projects/projects.module';
import { TaskModule } from './../tasks/task.module';
import { UsersModule } from './../users/users.module';
import { Roadmap } from './entities/readmap.entity';
import { RoadmapItem } from './entities/roadmap-Item.entity';
import { RoadmapController } from './roadmap.controller';
import { RoadmapService } from './roadmap.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Roadmap, RoadmapItem]),
    UsersModule,
    ProjectsModule,
    TaskModule,
  ],
  controllers: [RoadmapController],
  providers: [RoadmapService],
  exports: [RoadmapService],
})
export class RoadmapModule {}
