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
import { Report } from '@prisma/client';

import { CreateReportDto, UpdateReportDto } from './dto/report.dto';
import { ReportService } from './report.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  async create(
    @Body() createReportDto: CreateReportDto,
    @CurrentUser() user: any,
  ): Promise<Report> {
    return this.reportService.create({
      ...createReportDto,
      accountId: user.accountId,
      createdById: user.id,
    });
  }

  @Get('account')
  async findByAccount(
    @CurrentUser() user: any,
    @Query('isPublic') isPublic?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{
    reports: Report[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;
    const parsedIsPublic = isPublic ? isPublic === 'true' : undefined;

    return this.reportService.findByAccount(
      user.accountId,
      parsedIsPublic,
      type,
      parsedLimit,
      parsedOffset,
    );
  }

  @Get('user')
  async findByUser(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{
    reports: Report[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;

    return this.reportService.findByUser(
      user.id,
      user.accountId,
      parsedLimit,
      parsedOffset,
    );
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Report> {
    return this.reportService.findById(id, user.accountId);
  }

  @Get(':id/execute')
  async executeReport(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.reportService.executeReport(id, user.accountId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
    @CurrentUser() user: any,
  ): Promise<Report> {
    return this.reportService.update(id, updateReportDto, user.accountId);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    await this.reportService.delete(id, user.accountId);
    return { message: 'Report deleted successfully' };
  }
}
