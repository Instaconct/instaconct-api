import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Jwt } from '../provider/jwt.provider';
import { ModuleRef } from '@nestjs/core';
export declare class AuthenticationGuard implements CanActivate {
    private readonly jwtService;
    private moduleRef;
    private userService;
    constructor(jwtService: Jwt, moduleRef: ModuleRef);
    private getUserService;
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
}
