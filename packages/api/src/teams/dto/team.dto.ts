import { createZodDto } from 'nestjs-zod';

import {
  AddTeamMemberSchema,
  CreateTeamSchema,
  TeamResponseSchema,
  UpdateTeamSchema,
} from '@shared/dto/team.dto';

export class CreateTeamDto extends createZodDto(CreateTeamSchema) {}
export class TeamResponseDto extends createZodDto(TeamResponseSchema) {}
export class AddTeamMemberDto extends createZodDto(AddTeamMemberSchema) {}
export class UpdateTeamDto extends createZodDto(UpdateTeamSchema) {}
