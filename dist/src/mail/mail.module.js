"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailModule = void 0;
const common_1 = require("@nestjs/common");
const mail_service_1 = require("./mail.service");
const bullmq_1 = require("@nestjs/bullmq");
const mail_processor_1 = require("./mail.processor");
const prisma_module_1 = require("../prisma/prisma.module");
const mail_cron_1 = require("./mail.cron");
let MailModule = class MailModule {
};
exports.MailModule = MailModule;
exports.MailModule = MailModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({
                name: 'mail',
            }),
            prisma_module_1.PrismaModule,
        ],
        providers: [mail_service_1.MailService, mail_processor_1.MailConsumer, mail_cron_1.MailCronService],
        exports: [mail_service_1.MailService],
    })
], MailModule);
//# sourceMappingURL=mail.module.js.map