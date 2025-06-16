import { Injectable, NotFoundException } from '@nestjs/common';
import { Account } from '@prisma/client'; // or from '@prisma/client' if default

import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/account.dto';

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
