import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from '../interface/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import { IRefreshPayload } from '../interface/refresh-payload.interface';
import { Cache } from 'cache-manager';
export declare class Jwt {
    private readonly jwtService;
    private readonly configService;
    private cacheManager;
    readonly EXPIRE_TIME_REFRESH: number;
    constructor(jwtService: JwtService, configService: ConfigService, cacheManager: Cache);
    generateAccessToken(payload: IJwtPayload): string;
    generateRefreshToken(email: string, payload: IRefreshPayload): Promise<string>;
    verify(token: string): any;
    verifyAsync(token: string): Promise<any>;
    verifyRefreshToken(refreshToken: string, accessToken: string): Promise<string | false>;
    getRefreshPayload(refreshToken: string): Promise<IRefreshPayload>;
    revokeRefreshToken(refreshToken: string): Promise<boolean>;
    generateTicketToken(ticketId: string): Promise<string>;
    generateSdkToken(organizationId: string, sdkType: string): Promise<string>;
}
