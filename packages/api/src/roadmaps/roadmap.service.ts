import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateRoadmapDto, CreateRoadmapItemDto } from './dto/roadmap.dto';
import { Roadmap } from './entities/readmap.entity';
import { RoadmapItem } from './entities/roadmap-Item.entity';

@Injectable()
export class RoadmapService {
  constructor(
    @InjectRepository(Roadmap)
    private roadmapsRepository: Repository<Roadmap>,
    @InjectRepository(RoadmapItem)
    private roadmapItemsRepository: Repository<RoadmapItem>,
  ) {}

  async create(dto: CreateRoadmapDto): Promise<Roadmap> {
    const roadmap = this.roadmapsRepository.create({
      name: dto.name,
      description: dto.description,
      owner: { id: dto.ownerId },
    });
    return this.roadmapsRepository.save(roadmap);
  }

  async addItem(
    roadmapId: string,
    dto: CreateRoadmapItemDto,
  ): Promise<RoadmapItem> {
    const roadmap = await this.roadmapsRepository.findOne({
      where: { id: roadmapId },
    });
    if (!roadmap) throw new NotFoundException('Roadmap not found');
    const item = this.roadmapItemsRepository.create({
      roadmap: { id: roadmapId },
      project: { id: dto.projectId },
      task: { id: dto.taskId },
      startDate: dto.startDate,
      endDate: dto.endDate,
      dependencies: dto.dependencies,
    });
    return this.roadmapItemsRepository.save(item);
  }
}
