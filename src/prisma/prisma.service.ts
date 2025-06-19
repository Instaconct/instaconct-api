import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export const defaultUserOmit = {
  password: true,
  token: true,
  token_expires_at: true,
} as const;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
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
    this.$connect();
  }
}
