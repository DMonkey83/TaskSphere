import { Body, Controller, Post } from '@nestjs/common';
import { TaskActivityService } from './task-activity.service';
import { CreateTaskActivityDto } from './dto/task-activities.dto';

@Controller('task-activitys')
export class TaskActivityController {
  constructor(private readonly taskActivityService: TaskActivityService) {}

  @Post()
  create(@Body() createTaskActivityDto: CreateTaskActivityDto) {
    return this.taskActivityService.logActivity(createTaskActivityDto);
  }
}
