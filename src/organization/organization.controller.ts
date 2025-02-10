import { Controller, Get, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { User } from '@prisma/client';
import { GetUser } from 'src/shared/decorator/user.decorator';
import { AuthenticationGuard } from 'src/auth/guard/authentication.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';

@Controller('organization')
@UseGuards(AuthenticationGuard, RolesGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.organizationService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @GetUser() user: User,
  ) {
    return this.organizationService.update(id, updateOrganizationDto, user);
  }
}
