import { createZodDto } from 'nestjs-zod';

import { TeamSchema } from '@shared/dto/team.dto';

export class TeamDto extends createZodDto(TeamSchema) {}
