"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const jwt_provider_1 = require("./provider/jwt.provider");
const hash_provider_1 = require("./provider/hash.provider");
const jwt_1 = require("@nestjs/jwt");
const mail_module_1 = require("../mail/mail.module");
const authentication_guard_1 = require("./guard/authentication.guard");
const bullmq_1 = require("@nestjs/bullmq");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({}),
            bullmq_1.BullModule.registerQueue({
                name: 'org-sdk',
            }),
            prisma_module_1.PrismaModule,
            mail_module_1.MailModule,
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, jwt_provider_1.Jwt, hash_provider_1.Hash, authentication_guard_1.AuthenticationGuard],
        exports: [jwt_provider_1.Jwt, hash_provider_1.Hash, authentication_guard_1.AuthenticationGuard],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map