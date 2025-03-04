"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_provider_1 = require("./provider/jwt.provider");
const client_1 = require("@prisma/client");
const hash_provider_1 = require("./provider/hash.provider");
const mail_service_1 = require("../mail/mail.service");
const email_types_1 = require("../mail/email.types");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let AuthService = AuthService_1 = class AuthService {
    constructor(prismaService, jwtProvider, hashProvider, mailService, orgSdkQueue) {
        this.prismaService = prismaService;
        this.jwtProvider = jwtProvider;
        this.hashProvider = hashProvider;
        this.mailService = mailService;
        this.orgSdkQueue = orgSdkQueue;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async register(userRegistrationDto) {
        try {
            const checkEmail = await this.prismaService.user.findUnique({
                where: { email: userRegistrationDto.email },
            });
            if (checkEmail) {
                throw new common_1.ConflictException('Email already exists');
            }
            const organization = await this.prismaService.organization.create({
                data: userRegistrationDto.organization,
            });
            userRegistrationDto.role = client_1.Role.SUPER_MANAGER;
            userRegistrationDto.password = await this.hashProvider.hashPassword(userRegistrationDto.password);
            const emailVerifyToken = await this.hashProvider.generateRandomString();
            const user = await this.prismaService.user.create({
                data: {
                    name: userRegistrationDto.name,
                    email: userRegistrationDto.email,
                    password: userRegistrationDto.password,
                    organizationId: organization.id,
                    role: userRegistrationDto.role,
                    token: emailVerifyToken,
                    phone: userRegistrationDto.phone,
                },
                include: { organization: true },
            });
            await this.orgSdkQueue.add('create-sdk', {
                organizationId: organization.id,
                sdkType: client_1.SDKType.WEB,
            });
            const payload = {
                id: user.id,
                email: user.email,
            };
            const accessToken = this.jwtProvider.generateAccessToken(payload);
            const refreshPayload = {
                signature: accessToken.split('.')[2],
            };
            const refreshToken = await this.jwtProvider.generateRefreshToken(user.email, refreshPayload);
            await this.mailService.sendEmail(user.email, 'Account Created , Please Activate Your Email', { url: process.env.DEFAULT_VERIFY_URL + `?token=${emailVerifyToken}` }, email_types_1.EMAIL_TYPES.CONFIRM_EMAIL);
            return { accessToken, refreshToken, user };
        }
        catch (error) {
            this.logger.error("Couldn't register", error);
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            if (error.meta.target === 'Organization_name_key') {
                throw new common_1.ConflictException('Organization name already exists');
            }
            if (error.meta.target === 'User_phone_key') {
                throw new common_1.ConflictException('Phone number already exists');
            }
            if (error.meta.target === 'User_email_key') {
                throw new common_1.ConflictException('Email already exists');
            }
            this.prismaService.organization
                .delete({
                where: { name: userRegistrationDto.organization.name },
            })
                .catch((error) => {
                this.logger.error("Couldn't delete organization", error);
            });
            throw new common_1.InternalServerErrorException();
        }
        finally {
            await this.prismaService.$disconnect();
        }
    }
    async verifyEmail(token) {
        try {
            const user = await this.prismaService.user.findUnique({
                where: { token },
            });
            if (!user) {
                throw new common_1.NotFoundException('Invalid token');
            }
            await this.prismaService.user.update({
                where: { id: user.id },
                data: { token: null, is_verified: true },
            });
            return user;
        }
        catch (error) {
            this.logger.error("Couldn't verify email", error);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException();
        }
        finally {
            await this.prismaService.$disconnect();
        }
    }
    async login(email, plainPassword) {
        try {
            const user = await this.prismaService.user.findUnique({
                where: { email },
                include: { organization: true },
                omit: { password: false },
            });
            if (!user) {
                throw new common_1.ConflictException('Invalid credentials');
            }
            const password = user.password;
            const isPasswordValid = await this.hashProvider.comparePassword(plainPassword, password);
            if (!isPasswordValid) {
                throw new common_1.ConflictException('Invalid credentials');
            }
            const payload = {
                id: user.id,
                email: user.email,
            };
            const accessToken = this.jwtProvider.generateAccessToken(payload);
            const refreshPayload = {
                signature: accessToken.split('.')[2],
            };
            const refreshToken = await this.jwtProvider.generateRefreshToken(user.email, refreshPayload);
            delete user.password;
            return { accessToken, refreshToken, user };
        }
        catch (error) {
            this.logger.error("Couldn't login", error);
            throw error;
        }
        finally {
            await this.prismaService.$disconnect();
        }
    }
    async forgotPassword(email) {
        try {
            const user = await this.prismaService.user.findUnique({
                where: { email },
            });
            if (!user) {
                throw new common_1.ConflictException('User not found');
            }
            if (user.is_verified === false) {
                throw new common_1.ConflictException('User not verified');
            }
            if (user.token_expires_at && user.token_expires_at > new Date()) {
                throw new common_1.ConflictException('Token already exists');
            }
            const passwordResetToken = await this.hashProvider.generateRandomString();
            await this.prismaService.user.update({
                where: { id: user.id },
                data: {
                    token: passwordResetToken,
                    token_expires_at: new Date(Date.now() + 1000 * 60 * 15),
                },
            });
            await this.mailService.sendEmail(user.email, 'Password Reset Request', {
                url: process.env.DEFAULT_VERIFY_URL + `?token=${passwordResetToken}`,
            }, email_types_1.EMAIL_TYPES.RESET_PASSWORD);
            return { message: 'Password reset email sent' };
        }
        catch (error) {
            this.logger.error("Couldn't forgot password", error);
            return { message: 'Password reset email sent' };
        }
        finally {
            await this.prismaService.$disconnect();
        }
    }
    async resetPassword(token, newPassword) {
        try {
            const user = await this.prismaService.user.findUnique({
                where: { token: token },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid Token');
            }
            if (user.token_expires_at < new Date()) {
                throw new common_1.UnauthorizedException('Token expired');
            }
            await this.prismaService.user.update({
                where: { id: user.id },
                data: {
                    password: await this.hashProvider.hashPassword(newPassword),
                    token: null,
                    token_expires_at: null,
                },
            });
            return { message: 'Password reset successfully' };
        }
        catch (error) {
            this.logger.error("Couldn't reset password", error);
            throw error;
        }
        finally {
            await this.prismaService.$disconnect();
        }
    }
    async verifyToken(token) {
        try {
            const user = await this.prismaService.user.findUnique({
                where: { token },
            });
            if (!user) {
                throw new common_1.ConflictException('Invalid credentials');
            }
            if (user.token_expires_at < new Date()) {
                throw new common_1.ConflictException('Token expired');
            }
            return user;
        }
        catch (error) {
            this.logger.error("Couldn't verify token", error);
            throw new common_1.InternalServerErrorException();
        }
        finally {
            await this.prismaService.$disconnect();
        }
    }
    async refresh(refreshDto) {
        try {
            const { accessToken, refreshToken } = refreshDto;
            const verifiedPayload = await this.jwtProvider.verifyRefreshToken(refreshToken, accessToken);
            if (!verifiedPayload) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const user = await this.prismaService.user.findUnique({
                where: { email: verifiedPayload },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const payload = {
                id: user.id,
                email: user.email,
            };
            const newAccessToken = this.jwtProvider.generateAccessToken(payload);
            const refreshPayload = {
                signature: newAccessToken.split('.')[2],
            };
            const newRefreshToken = await this.jwtProvider.generateRefreshToken(user.email, refreshPayload);
            return { accessToken: newAccessToken, refreshToken: newRefreshToken };
        }
        catch (error) {
            this.logger.error("Couldn't refresh token", error);
            throw error;
        }
        finally {
            await this.prismaService.$disconnect();
        }
    }
    async logout(refreshToken) {
        try {
            const success = await this.jwtProvider.revokeRefreshToken(refreshToken);
            if (success)
                this.logger.log('Refresh token revoked');
            else
                this.logger.error('Failed to revoke refresh token');
        }
        catch (error) {
            this.logger.error("Couldn't revoke refresh token", error);
            throw new common_1.InternalServerErrorException();
        }
    }
    async authenticateSdk(sdkAuthDto, public_key) {
        try {
            if (!sdkAuthDto.private_key) {
                throw new common_1.UnauthorizedException('Invalid SDK credentials');
            }
            if (!public_key) {
                throw new common_1.UnauthorizedException('Invalid SDK credentials');
            }
            const sdk = await this.prismaService.orgManagementSDK.findFirst({
                where: {
                    public_key: public_key,
                    private_key: sdkAuthDto.private_key,
                },
                include: {
                    organization: true,
                },
            });
            if (!sdk) {
                throw new common_1.UnauthorizedException('Invalid SDK credentials');
            }
            const token = await this.jwtProvider.generateSdkToken(sdk.organizationId, client_1.SDKType.WEB);
            return { token, organizationId: sdk.organizationId };
        }
        catch (error) {
            this.logger.error("Couldn't authenticate SDK", error);
            throw error;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, bullmq_1.InjectQueue)('org-sdk')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_provider_1.Jwt,
        hash_provider_1.Hash,
        mail_service_1.MailService,
        bullmq_2.Queue])
], AuthService);
//# sourceMappingURL=auth.service.js.map