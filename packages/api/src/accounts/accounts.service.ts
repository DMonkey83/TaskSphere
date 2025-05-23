import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {}

  async create(dto: CreateAccountDto): Promise<Account> {
    const account = this.accountsRepository.create({
      name: dto.name,
      industry: dto.industry,
    });
    return this.accountsRepository.save(account);
  }

  async findById(id: string): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: { id },
    });

    if (!account) throw new NotFoundException('Account not found');
    return account;
  }
}
