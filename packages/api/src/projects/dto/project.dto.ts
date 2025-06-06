import {
  CreateProjectSchema,
  CreateProjectViewSchema,
  UpdateProjectSchema,
} from '@shared/dto/projects.dto';
import { createZodDto } from 'nestjs-zod';

export class CreateProjectDto extends createZodDto(CreateProjectSchema) {}
export class CreateProjectViewDto extends createZodDto(
  CreateProjectViewSchema,
) {}
export class UpdateProjectDto extends createZodDto(UpdateProjectSchema) {}
