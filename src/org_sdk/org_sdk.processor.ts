import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { OrgSdkService } from './org_sdk.service';

@Processor('org-sdk')
export class SdkConsumer extends WorkerHost {
  private readonly logger = new Logger(SdkConsumer.name);
  constructor(private readonly orgSdkService: OrgSdkService) {
    super();
  }

  async process(job: Job): Promise<any> {
    try {
      switch (job.name) {
        case 'create-sdk':
          await this.orgSdkService.create(
            job.data.organizationId,
            job.data.sdkType,
          );
          this.logger.log(
            `SDK created for organization ${job.data.organizationId}`,
          );
          return;
        default:
          this.logger.warn(`Unknown job name: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(`Error processing job ${job.id}: ${error}`);
      throw error;
    }
  }
}
