import { TeamSchema } from '@shared/dto/team.dto';
import { createZodDto } from 'nestjs-zod';

export class TeamDto extends createZodDto(TeamSchema) {}
