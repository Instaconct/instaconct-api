import { OrgSdkService } from './org_sdk.service';
import { User } from '@prisma/client';
export declare class OrgSdkController {
    private readonly orgSdkService;
    constructor(orgSdkService: OrgSdkService);
    getOrgSDKs(user: User): Promise<{
        organizationId: string;
        private_key: string;
        sdk: import("@prisma/client").$Enums.SDKType;
        public_key: string;
    }[]>;
}
