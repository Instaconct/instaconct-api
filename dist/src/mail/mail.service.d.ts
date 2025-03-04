import { MailerService } from '@nestjs-modules/mailer';
import { EMAIL_TYPES } from './email.types';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
export declare class MailService {
    private mailerService;
    private mailQueue;
    private prismaService;
    private readonly logger;
    constructor(mailerService: MailerService, mailQueue: Queue, prismaService: PrismaService);
    sendEmail(email: string, subject: string, context: any, type: EMAIL_TYPES): Promise<void>;
    storeFailedEmail(email: string, subject: string, context: any, type: EMAIL_TYPES): Promise<void>;
    retryFailedEmails(): Promise<void>;
    addToQueue(email: string, subject: string, context: any, type: EMAIL_TYPES): Promise<void>;
    sendEmailFromQueue(job: Job): Promise<unknown>;
}
