import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Hash } from 'src/auth/provider/hash.provider';
import { FilterUserDto } from './dto/filter-user.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
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

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      if (updateUserDto.organizationId) {
        throw new BadRequestException('OrganizationId cannot be updated');
      }

      if (updateUserDto.password) {
        updateUserDto.password = await this.hashProvider.hashPassword(
          updateUserDto.password,
        );
      }

      return this.prismaService.user.update({
        where: {
          id: id,
        },
        data: {
          ...updateUserDto,
        },
      });
    } catch (error) {
      return error;
    }
  }

  remove(id: string) {
    return this.prismaService.user.delete({
      where: {
        id: id,
      },
    });
  }
}
