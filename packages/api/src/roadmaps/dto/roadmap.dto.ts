import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateRoadmapDto = z.object({
  name: z.string().uuid(),
  ownerId: z.string().uuid(),
  description: z.string().optional(),
});

export const CreateRoadmapItemDto = z.object({
  projectId: z.string().uuid(),
  taskId: z.string().uuid(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  dependencies: z.record(z.string(), z.any()).optional(),
});

export class CreateRoadmapDtoClass extends createZodDto(CreateRoadmapDto) {}
export class CreateRoadmapItemDtoClass extends createZodDto(
  CreateRoadmapItemDto,
) {}
