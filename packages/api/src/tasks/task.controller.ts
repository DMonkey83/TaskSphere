import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from 'nestjs-zod';

import { UpateTaskSchema } from '@shared/dto/tasks.dto';

import { TaskService } from './task.service';
import { GetUser } from '../auth/get-user.decorator';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateTaskDto, LogTaskStatusDto, UpdateTaskDto } from './dto/task.dto';
import { User } from '../users/entities/user.entity';

@Controller('tasks')
export class TaskController {
  constructor(private readonly tasksService: TaskService) {}

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'team_lead', 'admin')
  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateTaskDto)) body: CreateTaskDto,
    @GetUser() user: User,
  ) {
    return this.tasksService.createTask(body, user);
  }

  @Get(':id/hierarchy')
  async getHierarchy(@Param('id') id: string) {
    return this.tasksService.getTaskWithHierarchy(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':taskId/status')
  async logStatus(
    @Param('taskId') taskId: string,
    @Body(new ZodValidationPipe(LogTaskStatusDto))
    body: LogTaskStatusDto,
  ) {
    return this.tasksService.logStatus(taskId, body);
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'team_lead', 'admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpateTaskSchema)) dto: Partial<UpdateTaskDto>,
    @GetUser() user: User,
  ) {
    return this.tasksService.update(id, dto, user);
  }
}
