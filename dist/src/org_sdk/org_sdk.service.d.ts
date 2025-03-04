import { SDKType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class OrgSdkService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    create(organizationId: string, sdkType: SDKType): Promise<{
        created_at: Date;
        updated_at: Date;
        organizationId: string;
        private_key: string;
        sdk: import("@prisma/client").$Enums.SDKType;
        public_key: string;
    }>;
    getOrgSDKs(organizationId: string): Promise<{
        organizationId: string;
        private_key: string;
        sdk: import("@prisma/client").$Enums.SDKType;
        public_key: string;
    }[]>;
    generateSDKPrivateKey(): Promise<string>;
    generateSDKPublicKey(): Promise<string>;
    private generateId;
}
