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
import { Sprint } from '@prisma/client';

import { CreateSprintDto, UpdateSprintDto } from './dto/sprint.dto';
import { SprintService } from './sprint.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sprints')
@UseGuards(JwtAuthGuard)
export class SprintController {
  constructor(private readonly sprintService: SprintService) {}

  @Post()
  async create(
    @Body() createSprintDto: CreateSprintDto,
    @CurrentUser() user: any,
  ): Promise<Sprint> {
    return this.sprintService.create({
      ...createSprintDto,
      ownerId: createSprintDto.ownerId || user.id,
    });
  }

  @Get('project/:projectId')
  async findByProject(
    @Param('projectId') projectId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{
    sprints: Sprint[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;

    return this.sprintService.findByProject(
      projectId,
      parsedLimit,
      parsedOffset,
    );
  }

  @Get('project/:projectId/active')
  async getActiveSprint(
    @Param('projectId') projectId: string,
  ): Promise<Sprint | null> {
    return this.sprintService.getActiveSprint(projectId);
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Query('projectId') projectId?: string,
  ): Promise<Sprint> {
    return this.sprintService.findById(id, projectId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSprintDto: UpdateSprintDto,
  ): Promise<Sprint> {
    return this.sprintService.update(id, updateSprintDto);
  }

  @Patch(':id/start')
  async startSprint(@Param('id') id: string): Promise<Sprint> {
    return this.sprintService.startSprint(id);
  }

  @Patch(':id/complete')
  async completeSprint(
    @Param('id') id: string,
    @Body() body: { velocity?: number },
  ): Promise<Sprint> {
    return this.sprintService.completeSprint(id, body.velocity);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.sprintService.delete(id);
    return { message: 'Sprint deleted successfully' };
  }
}
