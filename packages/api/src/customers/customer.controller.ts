import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from 'nestjs-zod';
import { CreateCustomerDtoClass } from './dto/customer.dto';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'admin')
  @Post()
  create(
    @Body(new ZodValidationPipe(CreateCustomerDtoClass))
    body: CreateCustomerDtoClass,
  ) {
    return this.customerService.create(body);
  }
}
