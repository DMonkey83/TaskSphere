import { createZodDto } from 'nestjs-zod';

import {
  CreateRoadmapSchema,
  CreateRoadmapItemSchema,
} from '@shared/dto/roadmaps.dto';

export class CreateRoadmapDto extends createZodDto(CreateRoadmapSchema) {}
export class CreateRoadmapItemDto extends createZodDto(
  CreateRoadmapItemSchema,
) {}
