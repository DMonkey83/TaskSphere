import { Roles } from './../auth/roles.decorator';
import { RoleGuard } from './../auth/role.guard';
import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { RoadmapService } from './roadmap.service';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from 'nestjs-zod';
import {
  CreateRoadmapDtoClass,
  CreateRoadmapItemDtoClass,
} from './dto/roadmap.dto';

@Controller('roadmaps')
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'admin')
  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateRoadmapDtoClass))
    body: CreateRoadmapDtoClass,
  ) {
    return this.roadmapService.create(body);
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'admin')
  @Post(':roadmapId/items')
  async addItem(
    @Param('roadmapId') roadmapId: string,
    @Body(new ZodValidationPipe(CreateRoadmapItemDtoClass))
    body: CreateRoadmapItemDtoClass,
  ) {
    return this.roadmapService.addItem(roadmapId, body);
  }
}
