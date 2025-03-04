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
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
const bullmq_1 = require("bullmq");
const bullmq_2 = require("@nestjs/bullmq");
const path_1 = require("path");
const prisma_service_1 = require("../prisma/prisma.service");
let MailService = MailService_1 = class MailService {
    constructor(mailerService, mailQueue, prismaService) {
        this.mailerService = mailerService;
        this.mailQueue = mailQueue;
        this.prismaService = prismaService;
        this.logger = new common_1.Logger(MailService_1.name);
    }
    async sendEmail(email, subject, context, type) {
        try {
            await this.addToQueue(email, subject, context, type);
        }
        catch (error) {
            this.logger.error('Failed to add email to queue', error);
        }
    }
    async storeFailedEmail(email, subject, context, type) {
        try {
            await this.prismaService.failedEmail.create({
                data: {
                    email,
                    subject,
                    context,
                    type,
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to store failed email', error);
        }
    }
    async retryFailedEmails() {
        const failedEmails = await this.prismaService.failedEmail.findMany({
            where: {
                status: 'PENDING',
                attempts: {
                    lt: 3,
                },
            },
        });
        if (!failedEmails.length)
            return this.logger.log('No failed emails to retry');
        for (const failedEmail of failedEmails) {
            try {
                await this.addToQueue(failedEmail.email, failedEmail.subject, failedEmail.context, failedEmail.type);
                await this.prismaService.failedEmail.update({
                    where: { id: failedEmail.id },
                    data: { status: 'SENT' },
                });
            }
            catch (error) {
                this.logger.error('Failed to retry failed email', error);
                await this.prismaService.failedEmail.update({
                    where: { id: failedEmail.id },
                    data: {
                        attempts: { increment: 1 },
                        status: 'FAILED',
                    },
                });
            }
        }
    }
    async addToQueue(email, subject, context, type) {
        await this.mailQueue.add('send-email', { email, subject, context, type }, {
            attempts: 3,
        });
    }
    async sendEmailFromQueue(job) {
        const { email, subject, context, type } = job.data;
        return await this.mailerService.sendMail({
            from: process.env.SUPPORT_MAIL,
            to: email,
            subject,
            template: (0, path_1.join)(__dirname, '..', '..', 'mail', 'templates', type),
            context,
        });
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_2.InjectQueue)('mail')),
    __metadata("design:paramtypes", [mailer_1.MailerService,
        bullmq_1.Queue,
        prisma_service_1.PrismaService])
], MailService);
//# sourceMappingURL=mail.service.js.map