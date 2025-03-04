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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Jwt = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const cache_manager_1 = require("@nestjs/cache-manager");
let Jwt = class Jwt {
    constructor(jwtService, configService, cacheManager) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.cacheManager = cacheManager;
        this.EXPIRE_TIME_REFRESH = 7 * 24 * 60 * 60 * 1000;
    }
    generateAccessToken(payload) {
        return this.jwtService.sign(payload, {
            secret: this.configService.getOrThrow('JWT_SECRET'),
            expiresIn: this.configService.getOrThrow('JWT_EXPIRATION_TIME'),
        });
    }
    async generateRefreshToken(email, payload) {
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRATION_TIME'),
        });
        await this.cacheManager.set(refreshToken, email, this.EXPIRE_TIME_REFRESH);
        return refreshToken;
    }
    verify(token) {
        return this.jwtService.verify(token, {
            secret: this.configService.getOrThrow('JWT_SECRET'),
        });
    }
    verifyAsync(token) {
        return this.jwtService.verifyAsync(token, {
            secret: this.configService.getOrThrow('JWT_SECRET'),
        });
    }
    async verifyRefreshToken(refreshToken, accessToken) {
        const payload = this.jwtService.verify(refreshToken, {
            secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        });
        if (payload.signature !== accessToken.split('.')[2]) {
            console.error('Invalid signature');
            return false;
        }
        const refreshValue = await this.cacheManager.get(refreshToken);
        const { email } = this.jwtService.decode(accessToken);
        if (refreshValue !== email) {
            console.error('Invalid email');
            return false;
        }
        await this.cacheManager.del(refreshToken);
        return email;
    }
    getRefreshPayload(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            return payload;
        }
        catch (error) {
            throw error;
        }
    }
    async revokeRefreshToken(refreshToken) {
        return await this.cacheManager.del(refreshToken);
    }
    async generateTicketToken(ticketId) {
        return this.jwtService.sign({ ticketId }, {
            secret: this.configService.getOrThrow('JWT_SECRET'),
            expiresIn: '1h',
        });
    }
    async generateSdkToken(organizationId, sdkType) {
        return this.jwtService.sign({ organizationId, sdkType }, {
            secret: this.configService.getOrThrow('JWT_SECRET'),
            expiresIn: '1h',
        });
    }
};
exports.Jwt = Jwt;
exports.Jwt = Jwt = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService, Object])
], Jwt);
//# sourceMappingURL=jwt.provider.js.map