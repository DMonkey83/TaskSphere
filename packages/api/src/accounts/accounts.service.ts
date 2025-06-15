import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/account.dto';
import { Account } from '../../generated/prisma'; // or from '@prisma/client' if default

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAccountDto): Promise<Account> {
    const account = await this.prisma.account.create({
      data: {
        name: dto.name,
      },
    });
    return account;
  }

  async findById(id: string): Promise<Account> {
    const account = await this.prisma.account.findUnique({
      where: { id },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }
}
