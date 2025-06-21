import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Milestone } from '@prisma/client';

import { CreateMilestoneDto, UpdateMilestoneDto } from './dto/milestone.dto';
import { MilestoneService } from './milestone.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('milestones')
@UseGuards(JwtAuthGuard)
export class MilestoneController {
  constructor(private readonly milestoneService: MilestoneService) {}

  @Post()
  async create(
    @Body() createMilestoneDto: CreateMilestoneDto,
    @CurrentUser() user: any,
  ): Promise<Milestone> {
    return this.milestoneService.create({
      ...createMilestoneDto,
      ownerId: createMilestoneDto.ownerId || user.id,
    });
  }

  @Get('project/:projectId')
  async findByProject(
    @Param('projectId') projectId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{
    milestones: Milestone[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;

    return this.milestoneService.findByProject(
      projectId,
      parsedLimit,
      parsedOffset,
    );
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Query('projectId') projectId?: string,
  ): Promise<Milestone> {
    return this.milestoneService.findById(id, projectId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMilestoneDto: UpdateMilestoneDto,
  ): Promise<Milestone> {
    return this.milestoneService.update(id, updateMilestoneDto);
  }

  @Patch(':id/progress')
  async updateProgress(
    @Param('id') id: string,
    @Body() body: { progress: number },
  ): Promise<Milestone> {
    return this.milestoneService.updateProgress(id, body.progress);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.milestoneService.delete(id);
    return { message: 'Milestone deleted successfully' };
  }
}
