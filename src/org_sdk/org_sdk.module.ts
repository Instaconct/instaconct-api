import { Module } from '@nestjs/common';
import { OrgSdkService } from './org_sdk.service';
import { OrgSdkController } from './org_sdk.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SdkConsumer } from './org_sdk.processor';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [OrgSdkController],
  providers: [OrgSdkService, SdkConsumer],
})
export class OrgSdkModule {}
