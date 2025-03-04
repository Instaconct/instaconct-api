import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from './mail.service';
export declare class MailConsumer extends WorkerHost {
    private readonly mailService;
    private readonly logger;
    constructor(mailService: MailService);
    process(job: Job<any, any, string>): Promise<any>;
}
