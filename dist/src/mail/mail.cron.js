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
var MailCronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailCronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const mail_service_1 = require("./mail.service");
let MailCronService = MailCronService_1 = class MailCronService {
    constructor(mailService) {
        this.mailService = mailService;
        this.logger = new common_1.Logger(MailCronService_1.name);
    }
    async handleRetryFailedEmails() {
        this.logger.debug('Retrying failed emails');
        await this.mailService.retryFailedEmails();
    }
};
exports.MailCronService = MailCronService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MailCronService.prototype, "handleRetryFailedEmails", null);
exports.MailCronService = MailCronService = MailCronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mail_service_1.MailService])
], MailCronService);
//# sourceMappingURL=mail.cron.js.map