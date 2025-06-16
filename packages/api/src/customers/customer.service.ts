import { Injectable } from '@nestjs/common';
import { Customer } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';

import { CreateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateCustomerDto): Promise<Customer> {
    const customer = this.prisma.customer.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        accountId: dto.accountId,
        createdById: dto.createdById,
      },
    });
    return customer;
  }
}
