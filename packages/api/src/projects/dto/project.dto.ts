import { createZodDto } from 'nestjs-zod';

import {
  CreateProjectSchema,
  CreateProjectViewSchema,
  UpdateProjectSchema,
  UpdateProjectStatusSchema,
} from '@shared/dto/projects.dto';

export class CreateProjectDto extends createZodDto(CreateProjectSchema) {}
export class CreateProjectViewDto extends createZodDto(
  CreateProjectViewSchema,
) {}
export class UpdateProjectDto extends createZodDto(UpdateProjectSchema) {}
export class UpdateProjectStatusDto extends createZodDto(
  UpdateProjectStatusSchema,
) {}
