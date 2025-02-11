import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from './mail.service';
import { Logger } from '@nestjs/common';

@Processor('mail')
export class MailConsumer extends WorkerHost {
  private readonly logger = new Logger(MailConsumer.name);
  constructor(private readonly mailService: MailService) {
    super();
  }
  async process(job: Job<any, any, string>): Promise<any> {
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
    } catch (error) {
      this.logger.error(`Error processing job ${job.id}: ${error}`);
      throw error;
    }
  }
}
