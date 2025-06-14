/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'stdout', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from database');
  }

  // Remove the custom transaction method for now - use built-in $transaction

  forAccount(accountId: string) {
    return this.$extends({
      name: 'account-scoped',
      query: {
        project: {
          $allOperations({ args, query }: any) {
            args.where = { ...args.where, accountId };
            return query(args);
          },
        },
        tasks: {
          $allOperations({ args, query }: any) {
            args.where = {
              ...args.where,
              project: { accountId },
            };
            return query(args);
          },
        },
        team: {
          $allOperations({ args, query }: any) {
            args.where = { ...args.where, accountId };
            return query(args);
          },
        },
        customers: {
          $allOperations({ args, query }: any) {
            args.where = { ...args.where, account_id: accountId };
            return query(args);
          },
        },
      },
    });
  }
}
