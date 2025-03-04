import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/Login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { User } from '@prisma/client';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { RestPasswordDto } from './dto/rest-password.dto';
import { SdkAuthDto } from './dto/sdk-auth.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    createSDK(sdkAuthDto: SdkAuthDto, apiKey: string): Promise<{
        token: string;
        organizationId: string;
    }>;
    login(userLoginDto: LoginDto): Promise<{
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
    refresh(refreshDto: RefreshDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    forgotPassword(forgetPasswordDto: ForgetPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(restPasswordDto: RestPasswordDto): Promise<{
        message: string;
    }>;
    verifyToken(verifyTokenDto: VerifyTokenDto): Promise<{
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
    verify(token: string): Promise<{
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
    logout(refreshToken: string): Promise<void>;
    me(user: User): Promise<{
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
}
