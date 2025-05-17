import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from 'nestjs-zod';
import { CreateTaskDto, LogTaskStatusDto } from './dto/task.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly tasksService: TaskService) {}

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'team_lead', 'admin')
  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateTaskDto)) body: CreateTaskDto,
  ) {
    return this.tasksService.create(body);
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
}
