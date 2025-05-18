import { createZodDto } from 'nestjs-zod';
import { CreateCustomerSchema } from '@shared/dto/customer.dto';

export class CreateCustomerDto extends createZodDto(CreateCustomerSchema) {}
