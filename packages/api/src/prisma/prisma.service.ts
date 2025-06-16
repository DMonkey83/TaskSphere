import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// type QueryArgs<T extends object = any> = {
//   where?: Record<string, unknown>;
// } & T;

// type PrismaQueryFn<TArgs = any, TResult = any> = (
//   args: TArgs,
// ) => Promise<TResult>;

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

  // forAccount(accountId: string) {
  //   return this.$extends({
  //     name: 'account-scoped',
  //     query: {
  //       project: {
  //         $allOperations({
  //           args,
  //           query,
  //         }: {
  //           args: QueryArgs;
  //           query: PrismaQueryFn;
  //         }) {
  //           if (typeof args === 'object' && args !== null && 'where' in args) {
  //             args.where = { ...args.where, accountId };
  //           }
  //           return query(args);
  //         },
  //       },
  //       accountInvite: {
  //         $allOperations({
  //           args,
  //           query,
  //         }: {
  //           args: QueryArgs;
  //           query: PrismaQueryFn;
  //         }) {
  //           if (typeof args === 'object' && args !== null && 'where' in args) {
  //             args.where = { ...args.where, accountId };
  //           }
  //           return query(args);
  //         },
  //       },
  //       task: {
  //         $allOperations({
  //           args,
  //           query,
  //         }: {
  //           args: QueryArgs;
  //           query: PrismaQueryFn;
  //         }) {
  //           if (typeof args === 'object' && args !== null && 'where' in args) {
  //             args.where = {
  //               ...args.where,
  //               project: { accountId },
  //             };
  //           }
  //           return query(args);
  //         },
  //       },
  //       team: {
  //         $allOperations({
  //           args,
  //           query,
  //         }: {
  //           args: QueryArgs;
  //           query: PrismaQueryFn;
  //         }) {
  //           if (typeof args === 'object' && args !== null && 'where' in args) {
  //             args.where = { ...args.where, accountId };
  //           }
  //           return query(args);
  //         },
  //       },
  //       user: {
  //         $allOperations({
  //           args,
  //           query,
  //         }: {
  //           args: QueryArgs;
  //           query: PrismaQueryFn;
  //         }) {
  //           if (typeof args === 'object' && args !== null && 'where' in args) {
  //             args.where = { ...args.where, accountId };
  //           }
  //           return query(args);
  //         },
  //       },
  //       customer: {
  //         $allOperations({
  //           args,
  //           query,
  //         }: {
  //           args: QueryArgs;
  //           query: PrismaQueryFn;
  //         }) {
  //           if (typeof args === 'object' && args !== null && 'where' in args) {
  //             args.where = { ...args.where, accountId };
  //           }
  //           return query(args);
  //         },
  //       },
  //     },
  //   });
  // }
}
