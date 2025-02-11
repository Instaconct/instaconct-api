import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EMAIL_TYPES } from './email.types';
import { Job, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { join } from 'path';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private mailerService: MailerService,
    @InjectQueue('mail') private mailQueue: Queue,
  ) {}
  async sendEmail(
    email: string,
    subject: string,
    context: any,
    type: EMAIL_TYPES,
  ) {
    await this.addToQueue(email, subject, context, type);
  }

  async addToQueue(
    email: string,
    subject: string,
    context: any,
    type: EMAIL_TYPES,
  ) {
    await this.mailQueue.add(
      'send-email',
      { email, subject, context, type },
      {
        attempts: 3,
      },
    );
  }

  async sendEmailFromQueue(job: Job): Promise<unknown> {
    const { email, subject, context, type } = job.data;
    return await this.mailerService.sendMail({
      from: process.env.SUPPORT_MAIL,
      to: email,
      subject,
      template: join(__dirname, '..', '..', 'mail', 'templates', type),
      context,
    });
  }
}
