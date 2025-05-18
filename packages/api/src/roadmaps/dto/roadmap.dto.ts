import {
  CreateRoadmapSchema,
  CreateRoadmapItemSchema,
} from '@shared/dto/roadmaps.dto';
import { createZodDto } from 'nestjs-zod';

export class CreateRoadmapDto extends createZodDto(CreateRoadmapSchema) {}
export class CreateRoadmapItemDto extends createZodDto(
  CreateRoadmapItemSchema,
) {}
