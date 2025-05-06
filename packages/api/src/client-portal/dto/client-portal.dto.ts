import { createZodDto } from 'nestjs-zod';
import { GrantAccessDto } from '@shared/dto/client-portal.dto';

export class GrantAccessDtoClass extends createZodDto(GrantAccessDto) { }
