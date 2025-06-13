import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { CreateCustomerDto } from './dto/customer.dto';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  create(dto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customersRepository.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      address: dto.address,
      industry: dto.industry,
      createdBy: { id: dto.createdById },
    } as DeepPartial<Customer>);
    return this.customersRepository.save(customer);
  }
}
