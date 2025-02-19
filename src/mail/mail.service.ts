import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EMAIL_TYPES } from './email.types';
import { Job, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private mailerService: MailerService,
    @InjectQueue('mail') private mailQueue: Queue,
    private prismaService: PrismaService,
  ) {}

  async sendEmail(
    email: string,
    subject: string,
    context: any,
    type: EMAIL_TYPES,
  ) {
    try {
      await this.addToQueue(email, subject, context, type);
    } catch (error) {
      this.logger.error('Failed to add email to queue', error);
    }
  }

  public async storeFailedEmail(
    email: string,
    subject: string,
    context: any,
    type: EMAIL_TYPES,
  ) {
    try {
      await this.prismaService.failedEmail.create({
        data: {
          email,
          subject,
          context,
          type,
        },
      });
    } catch (error) {
      this.logger.error('Failed to store failed email', error);
    }
  }

  // Add a method to retry failed emails
  async retryFailedEmails() {
    const failedEmails = await this.prismaService.failedEmail.findMany({
      where: {
        status: 'PENDING',
        attempts: {
          lt: 3, // Only retry emails that have been attempted less than 3 times
        },
      },
    });

    if (!failedEmails.length)
      return this.logger.log('No failed emails to retry');

    for (const failedEmail of failedEmails) {
      try {
        await this.addToQueue(
          failedEmail.email,
          failedEmail.subject,
          failedEmail.context,
          failedEmail.type as EMAIL_TYPES,
        );

        await this.prismaService.failedEmail.update({
          where: { id: failedEmail.id },
          data: { status: 'SENT' },
        });
      } catch (error) {
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
