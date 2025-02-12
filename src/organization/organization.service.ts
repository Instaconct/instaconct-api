import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role, User } from '@prisma/client';

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);
  constructor(private readonly prismaService: PrismaService) {}

  // async create(createOrganizationDto: CreateOrganizationDto, user: User) {
  //   if (user.role !== Role.SUPER_MANAGER) {
  //     throw new ForbiddenException(
  //       'Only super managers can create organizations',
  //     );
  //   }

  //   try {
  //     return await this.prismaService.organization.create({
  //       data: createOrganizationDto,
  //     });
  //   } catch (error) {
  //     this.logger.error(error);
  //     throw new BadRequestException('Failed to create organization');
  //   }
  // }

  // async findAll(user: User) {
  //   // Super managers can see all organizations
  //   if (user.role === Role.SUPER_MANAGER) {
  //     return await this.prismaService.organization.findMany({
  //       orderBy: { created_at: 'desc' },
  //     });
  //   }

  //   // Other users can only see their own organization
  //   return await this.prismaService.organization.findMany({
  //     where: { id: user.organizationId },
  //     orderBy: { created_at: 'desc' },
  //   });
  // }

  async findOne(id: string, user?: User) {
    const organization = await this.prismaService.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if user has permission to view this organization
    if (user && organization.id !== user.organizationId) {
      throw new ForbiddenException(
        'You do not have permission to view this organization',
      );
    }

    return organization;
  }

  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
    user: User,
  ) {
    const organization = await this.prismaService.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Only super managers of the same organization can update
    if (
      user.role !== Role.SUPER_MANAGER &&
      organization.id !== user.organizationId
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this organization',
      );
    }

    try {
      return await this.prismaService.organization.update({
        where: { id },
        data: updateOrganizationDto,
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Failed to update organization');
    }
  }
}
