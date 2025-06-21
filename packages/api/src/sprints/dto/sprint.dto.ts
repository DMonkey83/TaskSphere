import { createZodDto } from 'nestjs-zod';
import { ZodType } from 'zod';

import {
  CreateSprintSchema,
  UpdateSprintSchema,
  SprintResponseSchema,
  SprintsListResponseSchema,
} from '@shared/dto/sprints.dto';

export class CreateSprintDto extends createZodDto(
  CreateSprintSchema as ZodType,
) {}
export class UpdateSprintDto extends createZodDto(
  UpdateSprintSchema as ZodType,
) {}
export class SprintResponseDto extends createZodDto(
  SprintResponseSchema as ZodType,
) {}
export class SprintsListResponseDto extends createZodDto(
  SprintsListResponseSchema as ZodType,
) {}
