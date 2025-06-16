import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TaskActivity } from '@prisma/client';

import { CreateTaskActivityDto } from './dto/task-activities.dto';
import { TaskActivityService } from './task-activity.service';
import { UserPayload } from '../auth/dto/auth.dto';
import { GetUser } from '../auth/get-user.decorator';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('task-activities')
export class TaskActivityController {
  private readonly logger = new Logger(TaskActivityController.name);

  constructor(private readonly taskActivityService: TaskActivityService) {}

  // ===================== CORE ACTIVITY OPERATIONS =====================

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'team_lead', 'admin', 'owner')
  @Post()
  async create(
    @Body() createTaskActivityDto: CreateTaskActivityDto,
    @GetUser() user: UserPayload,
  ): Promise<TaskActivity> {
    this.logger.log(
      `Creating activity for task: ${createTaskActivityDto.taskId}`,
    );
    return this.taskActivityService.logActivity(createTaskActivityDto, user);
  }

  // ===================== TEAM ACTIVITIES =====================

  @UseGuards(AuthGuard('jwt'))
  @Get('team/:teamId')
  async getRecentActivitiesByTeam(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @GetUser() user: UserPayload,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number = 0,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number = 10,
  ): Promise<TaskActivity[]> {
    this.logger.log(`Fetching team activities for team: ${teamId}`);
    return this.taskActivityService.listRecentActivitiesByTeam(
      teamId,
      user,
      skip,
      take,
    );
  }

  // ===================== TASK ACTIVITIES =====================

  @UseGuards(AuthGuard('jwt'))
  @Get('task/:taskId')
  async getActivitiesByTask(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @GetUser() user: UserPayload,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number = 0,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number = 10,
  ): Promise<TaskActivity[]> {
    this.logger.log(`Fetching task activities for task: ${taskId}`);
    return this.taskActivityService.listActivitiesByTask(
      taskId,
      user,
      skip,
      take,
    );
  }

  // ===================== PROJECT ACTIVITIES =====================

  @UseGuards(AuthGuard('jwt'))
  @Get('project/:projectId')
  async getProjectActivities(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @GetUser() user: UserPayload,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number = 0,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take: number = 20,
  ): Promise<TaskActivity[]> {
    this.logger.log(`Fetching project activities for project: ${projectId}`);
    return this.taskActivityService.listProjectActivities(
      projectId,
      user,
      skip,
      take,
    );
  }

  // ===================== DASHBOARD ENDPOINTS =====================

  @UseGuards(AuthGuard('jwt'))
  @Get('account')
  async getAccountActivities(
    @GetUser() user: UserPayload,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number = 0,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take: number = 20,
  ): Promise<TaskActivity[]> {
    this.logger.log(
      `Fetching account activities for account: ${user.account.id}`,
    );
    return this.taskActivityService.listAccountActivities(user, skip, take);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user')
  async getUserActivities(
    @GetUser() user: UserPayload,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number = 0,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take: number = 20,
  ): Promise<TaskActivity[]> {
    this.logger.log(`Fetching user activities for user: ${user.userId}`);
    return this.taskActivityService.listUserActivities(user, skip, take);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('stats')
  async getActivityStats(@GetUser() user: UserPayload): Promise<{
    totalActivities: number;
    userActivities: number;
    recentActivityCount: number;
    topActions: Array<{ action: string; count: number }>;
  }> {
    this.logger.log(`Fetching activity stats for account: ${user.account.id}`);
    return this.taskActivityService.getActivityStats(user);
  }
}
