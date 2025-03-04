import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Jwt } from './provider/jwt.provider';
import { Hash } from './provider/hash.provider';
import { RefreshDto } from './dto/refresh.dto';
import { MailService } from 'src/mail/mail.service';
import { Queue } from 'bullmq';
import { SdkAuthDto } from './dto/sdk-auth.dto';
export declare class AuthService {
    private readonly prismaService;
    private readonly jwtProvider;
    private readonly hashProvider;
    private readonly mailService;
    private readonly orgSdkQueue;
    constructor(prismaService: PrismaService, jwtProvider: Jwt, hashProvider: Hash, mailService: MailService, orgSdkQueue: Queue);
    private readonly logger;
    register(userRegistrationDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            organization: {
                id: string;
                name: string;
                website: string | null;
                default_lang: string | null;
                created_at: Date;
                updated_at: Date;
                timezone: string | null;
            };
        } & {
            id: string;
            name: string;
            created_at: Date;
            updated_at: Date;
            email: string;
            password: string | null;
            organizationId: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.Role;
            is_verified: boolean;
            token: string | null;
            token_expires_at: Date | null;
        };
    }>;
    verifyEmail(token: string): Promise<{
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
        email: string;
        password: string | null;
        organizationId: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        is_verified: boolean;
        token: string | null;
        token_expires_at: Date | null;
    }>;
    login(email: string, plainPassword: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            organization: {
                id: string;
                name: string;
                website: string | null;
                default_lang: string | null;
                created_at: Date;
                updated_at: Date;
                timezone: string | null;
            };
        } & {
            id: string;
            name: string;
            created_at: Date;
            updated_at: Date;
            email: string;
            password: string | null;
            organizationId: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.Role;
            is_verified: boolean;
            token: string | null;
            token_expires_at: Date | null;
        };
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    verifyToken(token: string): Promise<{
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
        email: string;
        password: string | null;
        organizationId: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        is_verified: boolean;
        token: string | null;
        token_expires_at: Date | null;
    }>;
    refresh(refreshDto: RefreshDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<void>;
    authenticateSdk(sdkAuthDto: SdkAuthDto, public_key: string): Promise<{
        token: string;
        organizationId: string;
    }>;
}
