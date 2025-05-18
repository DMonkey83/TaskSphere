import { z } from 'zod';

export const CreateCustomerSchema = z.object({
  name: z.string().min(1),
  industry: z.enum(['programming', 'legal', 'logistics', 'other']),
  createdById: z.string().uuid(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});
