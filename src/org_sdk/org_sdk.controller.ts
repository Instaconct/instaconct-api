import { Controller, Get, UseGuards } from '@nestjs/common';
import { OrgSdkService } from './org_sdk.service';
import { AuthenticationGuard } from 'src/auth/guard/authentication.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { GetUser } from 'src/shared/decorator/user.decorator';
import { Role, User } from '@prisma/client';
import { Roles } from 'src/shared/decorator/roles.decorator';

@Controller('sdk')
@UseGuards(AuthenticationGuard, RolesGuard)
export class OrgSdkController {
  constructor(private readonly orgSdkService: OrgSdkService) {}

  @Get()
  @Roles(Role.SUPER_MANAGER, Role.MANAGER)
  async getOrgSDKs(@GetUser() user: User) {
    return this.orgSdkService.getOrgSDKs(user.organizationId);
  }
}
