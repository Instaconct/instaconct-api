import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export const defaultUserOmit = {
  password: true,
  token: true,
  token_expires_at: true,
  created_at: true,
} as const;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query'],
      omit: {
        user: {
          ...defaultUserOmit,
        },
      },
    });
  }

  onModuleDestroy() {
    this.$disconnect();
  }

  onModuleInit() {
    this.$on('query' as never, (e: any) => {
      console.log('Duration: ' + e.duration + 'ms');
    });

    this.$connect();
  }
}
