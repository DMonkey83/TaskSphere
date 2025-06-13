import { createZodDto } from 'nestjs-zod';

import { CreateTaskActivitySchema } from '@shared/dto/task-activities.dto';

export class CreateTaskActivityDto extends createZodDto(
  CreateTaskActivitySchema,
) {}
