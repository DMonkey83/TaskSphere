import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TaskActivityService } from './task-activity.service';
import { CreateTaskActivityDto } from './dto/task-activities.dto';
import { RoleGuard } from '../auth/role.guard';
import { TaskActivity } from './entities/task-activities.entity';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('task-activitys')
export class TaskActivityController {
  constructor(private readonly taskActivityService: TaskActivityService) {}

  @Post()
  create(@Body() createTaskActivityDto: CreateTaskActivityDto) {
    return this.taskActivityService.logActivity(createTaskActivityDto);
  }

  @Get('team/:teamId/account/:accountId')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  async getRecentActivitiesByTeam(
    @Param('teamId') teamId: string,
    @Param('accountId') accountId: string,
    @GetUser() user: User,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
  ): Promise<TaskActivity[]> {
    return this.taskActivityService.listRecentActivitiesByTeam(
      teamId,
      accountId,
      user,
      skip,
      take,
    );
  }

  @Get('task/:taskId/account/:accountId')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  async getActivitiesByTask(
    @Param('taskId') taskId: string,
    @Param('accountId') accountId: string,
    @GetUser() user: User,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
  ): Promise<TaskActivity[]> {
    return this.taskActivityService.listRecentActivitiesByTeam(
      taskId,
      accountId,
      user,
      skip,
      take,
    );
  }
}
