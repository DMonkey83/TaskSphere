import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Task, TaskStatusLog } from '@prisma/client';
import { ZodValidationPipe } from 'nestjs-zod';

import {
  CreateTaskSchema,
  UpateTaskSchema,
  TaskFilterSchema,
} from '@shared/dto/tasks.dto';

import { TaskService } from './task.service';
import { UserPayload } from '../auth/dto/auth.dto';
import { GetUser } from '../auth/get-user.decorator';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import {
  CreateTaskDto,
  LogTaskStatusDto,
  TaskFilterDto,
  TaskListResponseDto,
  UpdateTaskDto,
} from './dto/task.dto';

@Controller('tasks')
export class TaskController {
  private readonly logger = new Logger(TaskController.name);
  constructor(private readonly tasksService: TaskService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(
    @Query(new ZodValidationPipe(TaskFilterSchema)) filters: TaskFilterDto,
    @GetUser() user: UserPayload,
  ): Promise<TaskListResponseDto> {
    this.logger.log(`Fetching tasks for user: ${user.userId}`);
    return this.tasksService.findAll(filters, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('assigned-to-me')
  async findAssignedToMe(
    @Query() filters: Omit<TaskFilterDto, 'assigneeId'>,
    @GetUser() user: UserPayload,
  ): Promise<TaskListResponseDto> {
    this.logger.log(`Fetching tasks assigned to user: ${user.userId}`);
    return this.tasksService.findAssignedToUser(filters, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('created-by-me')
  async findCreatedByMe(
    @Query() filters: Omit<TaskFilterDto, 'creatorId'>,
    @GetUser() user: UserPayload,
  ): Promise<TaskListResponseDto> {
    this.logger.log(`Fetching tasks created by user: ${user.userId}`);
    return this.tasksService.findCreatedByUser(filters, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('project/:projectId')
  async findByProject(
    @Param('projectId') projectId: string,
    @Query(new ZodValidationPipe(TaskFilterSchema))
    filters: TaskFilterDto,
    @GetUser() user: UserPayload,
  ): Promise<TaskListResponseDto> {
    this.logger.log(`Fetching tasks for project: ${projectId}`);
    return this.tasksService.findByProject(projectId, filters, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @GetUser() user: UserPayload,
  ): Promise<Task> {
    this.logger.log(`Fetching task: ${id}`);
    return this.tasksService.findOne(id, user);
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'team_lead', 'admin', 'owner')
  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateTaskSchema)) body: CreateTaskDto,
    @GetUser()
    user: UserPayload,
  ): Promise<Task> {
    this.logger.log(
      `Creating task with title: ${body.title}, type: ${body.type}, projectId: ${body.projectId}`,
    );
    const task = await this.tasksService.createTask(body, user);
    return task;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/hierarchy')
  async getHierarchy(
    @Param('id') id: string,
    @GetUser() user: UserPayload,
  ): Promise<Task> {
    return this.tasksService.getTaskWithHierarchy(id, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':taskId/status')
  async logStatus(
    @Param('taskId') taskId: string,
    @Body(new ZodValidationPipe(LogTaskStatusDto))
    body: LogTaskStatusDto,
    @GetUser() user: UserPayload,
  ): Promise<TaskStatusLog> {
    return this.tasksService.logStatus(taskId, body, user);
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'team_lead', 'admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpateTaskSchema)) dto: Partial<UpdateTaskDto>,
    @GetUser() user: UserPayload,
  ): Promise<Task> {
    return this.tasksService.update(id, dto, user);
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'team_lead', 'admin', 'owner')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @GetUser() user: UserPayload,
  ): Promise<void> {
    this.logger.log(`Deleting task: ${id}`);
    return this.tasksService.remove(id, user);
  }
}
