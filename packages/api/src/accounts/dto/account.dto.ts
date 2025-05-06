import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  industry: z.enum(['programming', 'legal', 'logistics', 'other']),
});

export class CreateAccountDto extends createZodDto(CreateAccountSchema) {}
