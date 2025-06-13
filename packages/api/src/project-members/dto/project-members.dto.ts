import { createZodDto } from 'nestjs-zod';

import {
  AddProjectMemberSchema,
  RemoverProjectMemberSchema,
} from '@shared/dto/project-members.dto';

export class AddProjectMemberDto extends createZodDto(AddProjectMemberSchema) {}
export class RemoveProjectMemberDto extends createZodDto(
  RemoverProjectMemberSchema,
) {}
