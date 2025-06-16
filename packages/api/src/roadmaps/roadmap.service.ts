import { Injectable, NotFoundException } from '@nestjs/common';
import { Roadmap, RoadmapItem } from '@prisma/client';

import { CreateRoadmapDto, CreateRoadmapItemDto } from './dto/roadmap.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoadmapService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoadmapDto): Promise<Roadmap> {
    return await this.prisma.roadmap.create({
      data: {
        name: dto.name,
        description: dto.description,
        owner: { connect: { id: dto.ownerId } },
      },
    });
  }

  async addItem(
    roadmapId: string,
    dto: CreateRoadmapItemDto,
  ): Promise<RoadmapItem> {
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id: roadmapId },
    });
    if (!roadmap) throw new NotFoundException('Roadmap not found');
    const item = await this.prisma.roadmapItem.create({
      data: {
        roadmap: { connect: { id: roadmapId } },
        project: { connect: { id: dto.projectId } },
        task: { connect: { id: dto.taskId } },
        startDate: dto.startDate,
        endDate: dto.endDate,
        dependencies: dto.dependencies,
      },
    });
    return item;
  }
}
