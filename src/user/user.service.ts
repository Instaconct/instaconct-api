import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Hash } from 'src/auth/provider/hash.provider';
import { FilterUserDto } from './dto/filter-user.dto';
import { Prisma, Role, User } from '@prisma/client';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashProvider: Hash,
  ) {}

  async create(createUserDto: CreateUserDto) {
    createUserDto.password = await this.hashProvider.hashPassword(
      createUserDto.password,
    );

    return this.prismaService.user.create({
      data: {
        ...createUserDto,
        organizationId: createUserDto.organizationId,
      },
    });
  }

  async findAll(filterUserDto: FilterUserDto) {
    const {
      organizationId,
      name,
      email,
      is_verified,
      phone,
      role,
      page = 1,
      take = 10,
    } = filterUserDto;

    const where: Prisma.UserWhereInput = {
      organizationId,
      ...(name && { name: { contains: name } }),
      ...(email && { email: { contains: email } }),
      ...(is_verified !== undefined && { is_verified }),
      ...(phone && { phone: { contains: phone } }),
      ...(role && { role }),
    };

    const skip = (page - 1) * take;

    const [total, users] = await Promise.all([
      this.prismaService.user.count({ where }),
      this.prismaService.user.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        take,
        pageCount: Math.ceil(total / take),
      },
    };
  }

  async findOneById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async findOneByIdAndTicketOpen(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
      include: {
        tickets: {
          where: {
            status: 'OPEN',
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, user: User) {
    const requestedUser = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!requestedUser) {
      throw new NotFoundException('User not found');
    }

    // Check if user has permission to update
    if (
      requestedUser.organizationId !== user.organizationId ||
      (user.role !== Role.SUPER_MANAGER && user.role !== Role.MANAGER)
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this user',
      );
    }

    if (updateUserDto.password) {
      updateUserDto.password = await this.hashProvider.hashPassword(
        updateUserDto.password,
      );
    }

    try {
      return await this.prismaService.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Failed to update user');
    }
  }

  async remove(id: string, user: User) {
    const requestedUser = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!requestedUser) {
      throw new NotFoundException('User not found');
    }

    if (
      requestedUser.organizationId !== user.organizationId ||
      (user.role !== Role.SUPER_MANAGER && user.role !== Role.MANAGER)
    ) {
      throw new ForbiddenException(
        'You do not have permission to delete this user',
      );
    }

    return await this.prismaService.user.delete({
      where: {
        id: id,
      },
    });
  }
}
