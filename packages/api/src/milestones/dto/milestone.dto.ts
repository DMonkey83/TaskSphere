import { createZodDto } from 'nestjs-zod';
import { ZodType } from 'zod';

import {
  CreateMilestoneSchema,
  UpdateMilestoneSchema,
  MilestoneResponseSchema,
  MilestonesListResponseSchema,
} from '@shared/dto/milestones.dto';

export class CreateMilestoneDto extends createZodDto(
  CreateMilestoneSchema as ZodType,
) {}
export class UpdateMilestoneDto extends createZodDto(
  UpdateMilestoneSchema as ZodType,
) {}
export class MilestoneResponseDto extends createZodDto(
  MilestoneResponseSchema as ZodType,
) {}
export class MilestonesListResponseDto extends createZodDto(
  MilestonesListResponseSchema as ZodType,
) {}
