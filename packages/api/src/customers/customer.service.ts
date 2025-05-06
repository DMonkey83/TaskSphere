import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';
import { CreateCustomerDtoClass } from './dto/customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  create(dto: CreateCustomerDtoClass): Promise<Customer> {
    const customer = this.customersRepository.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      address: dto.address,
      industry: dto.industry,
      createdBy: { id: dto.createdById },
    });
    return this.customersRepository.save(customer);
  }
}
