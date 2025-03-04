import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { OrgSdkService } from './org_sdk.service';
export declare class SdkConsumer extends WorkerHost {
    private readonly orgSdkService;
    private readonly logger;
    constructor(orgSdkService: OrgSdkService);
    process(job: Job): Promise<any>;
}
