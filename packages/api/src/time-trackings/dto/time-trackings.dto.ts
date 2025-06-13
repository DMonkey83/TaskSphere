import { createZodDto } from 'nestjs-zod';

import { CreateTimeTrackingSchema } from '@shared/dto/time-trackings.dto';

export class CreateTimeTrackingDto extends createZodDto(
  CreateTimeTrackingSchema,
) {}
