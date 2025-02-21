import { Injectable } from '@nestjs/common';
import { SDKType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrgSdkService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(organizationId: string, sdkType: SDKType) {
    return this.prismaService.orgManagementSDK.create({
      data: {
        organizationId: organizationId,
        private_key: await this.generateSDKPrivateKey(),
        public_key: await this.generateSDKPublicKey(),
        sdk: sdkType,
      },
    });
  }

  async getOrgSDKs(organizationId: string) {
    return this.prismaService.orgManagementSDK.findMany({
      where: {
        organizationId: organizationId,
      },
      omit: {
        // private_key: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async generateSDKPrivateKey() {
    return this.generateId('pvk_sdk');
  }

  async generateSDKPublicKey() {
    return this.generateId('org_sdk');
  }

  private generateId = async (prefix: string) => {
    const { customAlphabet } = await import('nanoid');
    const nanoid = customAlphabet(
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYё0123456789',
      25,
    );
    return `${prefix}_${nanoid()}`;
  };
}
