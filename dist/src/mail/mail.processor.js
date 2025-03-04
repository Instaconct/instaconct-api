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
var MailConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailConsumer = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const mail_service_1 = require("./mail.service");
const common_1 = require("@nestjs/common");
let MailConsumer = MailConsumer_1 = class MailConsumer extends bullmq_1.WorkerHost {
    constructor(mailService) {
        super();
        this.mailService = mailService;
        this.logger = new common_1.Logger(MailConsumer_1.name);
    }
    async process(job) {
        const { email, subject, context, type } = job.data;
        try {
            switch (job.name) {
                case 'send-email':
                    const messageResult = await this.mailService.sendEmailFromQueue(job);
                    this.logger.log(`Email sent to ${messageResult['messageId']}`);
                    return messageResult;
                default:
                    this.logger.warn(`Unknown job name: ${job.name}`);
                    return false;
            }
        }
        catch (error) {
            this.logger.error(`Error processing job ${job.id}: ${error}`);
            await this.mailService.storeFailedEmail(email, subject, context, type);
            throw error;
        }
    }
};
exports.MailConsumer = MailConsumer;
exports.MailConsumer = MailConsumer = MailConsumer_1 = __decorate([
    (0, bullmq_1.Processor)('mail'),
    __metadata("design:paramtypes", [mail_service_1.MailService])
], MailConsumer);
//# sourceMappingURL=mail.processor.js.map