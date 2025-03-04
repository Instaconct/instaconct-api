import { CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Jwt } from '../provider/jwt.provider';
export declare class SdkGuard implements CanActivate {
    private readonly prismaService;
    private readonly jwtProvider;
    constructor(prismaService: PrismaService, jwtProvider: Jwt);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
