import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Hash } from 'src/auth/provider/hash.provider';
import { FilterUserDto } from './dto/filter-user.dto';
import { Prisma, Role, User } from '@prisma/client';
import Excel from 'exceljs';
import { isEmail } from 'class-validator';

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

  async createAgent(createUserDto: CreateUserDto) {
    try {
      return await this.prismaService.user.create({
        data: {
          ...createUserDto,
          role: Role.AGENT,
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Failed to create agent');
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async findAllAgent(organizationId: string) {
    try {
      return await this.prismaService.user.findMany({
        where: {
          role: Role.AGENT,
          organizationId,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async createManager(createUserDto: CreateUserDto) {
    try {
      return await this.prismaService.user.create({
        data: {
          ...createUserDto,
          role: Role.MANAGER,
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Failed to create manager');
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  // create agents with csv/excel sheet
  async createAgents(createUserDto: CreateUserDto[]) {
    try {
      return await this.prismaService.user.createMany({
        data: createUserDto,
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Failed to create agents');
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  //handle the reading of csv / excel
  async readCsv(file: Express.Multer.File, organizationId: string) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Invalid file upload');
    }

    try {
      const csvData = file.buffer.toString();
      const rows = csvData.split('\n');

      if (rows.length < 2) {
        throw new BadRequestException('CSV file is empty or invalid');
      }

      const headers = rows[0]
        .split(',')
        .map((header) => header.trim().toUpperCase());

      // Validate required columns
      const requiredColumns = ['NAME', 'EMAIL'];
      const missingColumns = requiredColumns.filter(
        (col) => !headers.includes(col),
      );

      if (missingColumns.length) {
        throw new BadRequestException(
          `Missing required columns: ${missingColumns.join(', ')}`,
        );
      }
      console.log(rows.length);
      if (rows.length > 102) {
        throw new UnprocessableEntityException('Maximum 100 rows allowed');
      }

      const data: CreateUserDto[] = [];
      const emailSet = new Set<string>();

      for (let i = 1; i < rows.length; i++) {
        const csvRowData = rows[i].split(',');
        const rowData: Record<string, string> = {};

        headers.forEach((header, index) => {
          rowData[header] = csvRowData[index]?.trim() || '';
        });

        // Validate email format
        if (!isEmail(rowData['EMAIL'])) {
          throw new BadRequestException(`Invalid email format at row ${i + 1}`);
        }

        // Check for duplicate emails
        if (emailSet.has(rowData['EMAIL'])) {
          throw new BadRequestException(
            `Duplicate email found at row ${i + 1}`,
          );
        }
        emailSet.add(rowData['EMAIL']);

        data.push({
          name: rowData['NAME'],
          email: rowData['EMAIL'],
          password: await this.hashProvider.hashPassword(organizationId),
          organizationId,
          role: Role.AGENT,
        });
      }

      return await this.prismaService.user.createMany({
        data,
      });
    } catch (error) {
      this.logger.error('CSV processing failed:', error);
      console.log(error);
      if (error.code === 'P2002')
        throw new UnprocessableEntityException('Duplicate email found');

      throw error instanceof BadRequestException ||
        error instanceof UnprocessableEntityException
        ? error
        : new InternalServerErrorException('Failed to process CSV file');
    }
  }

  async readExcelSheet(file: Express.Multer.File, organizationId: string) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Invalid file upload');
    }

    try {
      const workbook = new Excel.Workbook();
      await workbook.xlsx.load(file.buffer);
      const worksheet = workbook.getWorksheet(1);

      if (!worksheet || worksheet.rowCount < 2) {
        throw new BadRequestException('Excel sheet is empty or invalid');
      }

      const headers = (worksheet.getRow(1).values as Excel.CellValue[]).map(
        (header) => header?.toString().trim().toUpperCase(),
      );

      // Validate required columns
      const requiredColumns = ['NAME', 'EMAIL'];
      const missingColumns = requiredColumns.filter(
        (col) => !headers.includes(col),
      );

      if (missingColumns.length) {
        throw new BadRequestException(
          `Missing required columns: ${missingColumns.join(', ')}`,
        );
      }

      const rows: CreateUserDto[] = [];
      const emailSet = new Set<string>();

      if (worksheet.rowCount > 101) {
        throw new UnprocessableEntityException('Maximum 100 rows allowed');
      }

      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i).values as Excel.CellValue[];
        const rowData: Record<string, string> = {};

        headers.forEach((header, index) => {
          const value = row[index]?.toString().trim() || '';
          rowData[header] = value;
        });

        // Validate email format
        if (!isEmail(rowData['EMAIL'].trim())) {
          console.log(rowData);
          throw new BadRequestException(`Invalid email format at row ${i}`);
        }

        // Check for duplicate emails
        if (emailSet.has(rowData['EMAIL'])) {
          throw new BadRequestException(`Duplicate email found at row ${i}`);
        }
        emailSet.add(rowData['EMAIL']);

        rows.push({
          name: rowData['NAME'],
          email: rowData['EMAIL'],
          password: await this.hashProvider.hashPassword(organizationId),
          organizationId,
          role: Role.AGENT,
        });
      }

      const MAX_ROWS = 100;
      if (rows.length > MAX_ROWS) {
        throw new BadRequestException(`Maximum ${MAX_ROWS} rows allowed`);
      }

      const res = await this.prismaService.user.createMany({
        data: rows,
      });

      return res;
    } catch (error) {
      this.logger.error('Excel sheet processing failed:', error);
      throw error instanceof BadRequestException ||
        error instanceof UnprocessableEntityException
        ? error
        : new InternalServerErrorException('Failed to process Excel sheet');
    }
  }
}
