import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Approval } from '@prisma/client';

import { ApprovalService } from './approval.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateApprovalDto, UpdateApprovalDto } from './dto/approval.dto';

@Controller('approvals')
@UseGuards(JwtAuthGuard)
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Post()
  async create(
    @Body() createApprovalDto: CreateApprovalDto,
    @CurrentUser() user: any,
  ): Promise<Approval> {
    return this.approvalService.create({
      ...createApprovalDto,
      requesterId: user.id,
    });
  }

  @Get('user/requests')
  async getUserRequests(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{
    approvals: Approval[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;

    return this.approvalService.findByUser(
      user.id,
      'requester',
      parsedLimit,
      parsedOffset,
    );
  }

  @Get('user/reviews')
  async getUserReviews(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{
    approvals: Approval[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;

    return this.approvalService.findByUser(
      user.id,
      'reviewer',
      parsedLimit,
      parsedOffset,
    );
  }

  @Get('project/:projectId')
  async findByProject(
    @Param('projectId') projectId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{
    approvals: Approval[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;

    return this.approvalService.findByProject(
      projectId,
      parsedLimit,
      parsedOffset,
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Approval> {
    return this.approvalService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateApprovalDto: UpdateApprovalDto,
    @CurrentUser() user: any,
  ): Promise<Approval> {
    return this.approvalService.updateApproval(id, updateApprovalDto, user.id);
  }

  @Patch(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body() body: { comments?: string },
    @CurrentUser() user: any,
  ): Promise<Approval> {
    return this.approvalService.approve(id, user.id, body.comments);
  }

  @Patch(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body() body: { comments?: string },
    @CurrentUser() user: any,
  ): Promise<Approval> {
    return this.approvalService.reject(id, user.id, body.comments);
  }

  @Patch(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Approval> {
    return this.approvalService.cancel(id, user.id);
  }
}
