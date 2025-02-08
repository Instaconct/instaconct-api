import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Hash } from 'src/auth/provider/hash.provider';

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

  async findAll(organizationId: string) {
    return await this.prismaService.user.findMany({
      where: {
        organizationId: organizationId,
      },
    });
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

  update(id: string, updateUserDto: UpdateUserDto) {
    try {
      if (updateUserDto.organizationId) {
        throw new BadRequestException('OrganizationId cannot be updated');
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
