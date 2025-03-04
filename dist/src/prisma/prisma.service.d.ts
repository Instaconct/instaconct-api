import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare const defaultUserOmit: {
    readonly password: true;
    readonly token: true;
    readonly token_expires_at: true;
};
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor();
    onModuleDestroy(): void;
    onModuleInit(): void;
}
