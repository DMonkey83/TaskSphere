import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateCustomerDto = z.object({
  name: z.string().min(1),
  industry: z.enum(['programming', 'legal', 'logistics', 'other']),
  createdById: z.string().uuid(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export class CreateCustomerDtoClass extends createZodDto(CreateCustomerDto) {}
