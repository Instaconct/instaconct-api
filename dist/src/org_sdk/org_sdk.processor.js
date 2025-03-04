"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SdkConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SdkConsumer = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const org_sdk_service_1 = require("./org_sdk.service");
let SdkConsumer = SdkConsumer_1 = class SdkConsumer extends bullmq_1.WorkerHost {
    constructor(orgSdkService) {
        super();
        this.orgSdkService = orgSdkService;
        this.logger = new common_1.Logger(SdkConsumer_1.name);
    }
    async process(job) {
        try {
            switch (job.name) {
                case 'create-sdk':
                    await this.orgSdkService.create(job.data.organizationId, job.data.sdkType);
                    this.logger.log(`SDK created for organization ${job.data.organizationId}`);
                    return;
                default:
                    this.logger.warn(`Unknown job name: ${job.name}`);
            }
        }
        catch (error) {
            this.logger.error(`Error processing job ${job.id}: ${error}`);
            throw error;
        }
    }
};
exports.SdkConsumer = SdkConsumer;
exports.SdkConsumer = SdkConsumer = SdkConsumer_1 = __decorate([
    (0, bullmq_1.Processor)('org-sdk'),
    __metadata("design:paramtypes", [org_sdk_service_1.OrgSdkService])
], SdkConsumer);
//# sourceMappingURL=org_sdk.processor.js.map