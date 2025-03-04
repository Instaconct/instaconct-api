"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const messages_module_1 = require("./messages/messages.module");
const auth_module_1 = require("./auth/auth.module");
const prisma_module_1 = require("./prisma/prisma.module");
const config_1 = require("@nestjs/config");
const user_module_1 = require("./user/user.module");
const organization_module_1 = require("./organization/organization.module");
const cache_manager_1 = require("@nestjs/cache-manager");
const redis_1 = require("@keyv/redis");
const logger_middleware_1 = require("./middleware/logger.middleware");
const mailer_1 = require("@nestjs-modules/mailer");
const handlebars_adapter_1 = require("@nestjs-modules/mailer/dist/adapters/handlebars.adapter");
const node_path_1 = require("node:path");
const mail_module_1 = require("./mail/mail.module");
const bullmq_1 = require("@nestjs/bullmq");
const ticket_module_1 = require("./ticket/ticket.module");
const org_sdk_module_1 = require("./org_sdk/org_sdk.module");
const schedule_1 = require("@nestjs/schedule");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(logger_middleware_1.LoggerMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                ignoreEnvFile: false,
            }),
            cache_manager_1.CacheModule.registerAsync({
                useFactory: (configService) => ({
                    stores: [
                        (0, redis_1.createKeyv)(`redis://${configService.getOrThrow('REDIS_HOST')}:${configService.getOrThrow('REDIS_PORT')}`),
                    ],
                }),
                inject: [config_1.ConfigService],
                isGlobal: true,
            }),
            bullmq_1.BullModule.forRoot({
                connection: {
                    host: process.env.REDIS_HOST,
                    port: +process.env.REDIS_PORT,
                },
                prefix: 'bullmq',
            }),
            mailer_1.MailerModule.forRoot({
                transport: {
                    service: process.env.MAIL_HOST,
                    auth: {
                        user: process.env.USER_EMAIL,
                        pass: process.env.EMAIL_PASS,
                    },
                },
                defaults: {
                    from: 'omarsabra509@gmail.com',
                },
                template: {
                    dir: (0, node_path_1.join)(__dirname, 'mail', 'templates'),
                    adapter: new handlebars_adapter_1.HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
            schedule_1.ScheduleModule.forRoot(),
            mail_module_1.MailModule,
            messages_module_1.MessagesModule,
            auth_module_1.AuthModule,
            prisma_module_1.PrismaModule,
            user_module_1.UserModule,
            organization_module_1.OrganizationModule,
            ticket_module_1.TicketModule,
            org_sdk_module_1.OrgSdkModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map