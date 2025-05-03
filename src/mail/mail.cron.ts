import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from './mail.service';

/**
 * @deprecated This cron service is deprecated and will be removed in a future version.
 * Please use the new mail processing system instead.
 */
@Injectable()
export class MailCronService {
  private readonly logger = new Logger(MailCronService.name);

  constructor(private readonly mailService: MailService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleRetryFailedEmails() {
    this.logger.debug('Retrying failed emails');
    await this.mailService.retryFailedEmails();
  }
}
