import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EMAIL_TYPES } from './email.types';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private mailerService: MailerService) {}
  async sendEmail(
    email: string,
    subject: string,
    context: any,
    type: EMAIL_TYPES,
  ) {
    try {
      await this.mailerService.sendMail({
        from: process.env.SUPPORT_MAIL,
        to: email,
        subject,
        template: `./${type}`,
        context,
      });

      this.logger.log('Email sent');
    } catch (error) {
      this.logger.error(error, 'MailService');
      console.log(error);
      return error;
    }
  }
}
