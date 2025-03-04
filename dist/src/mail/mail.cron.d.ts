import { MailService } from './mail.service';
export declare class MailCronService {
    private readonly mailService;
    private readonly logger;
    constructor(mailService: MailService);
    handleRetryFailedEmails(): Promise<void>;
}
