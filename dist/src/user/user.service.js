"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var UserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const hash_provider_1 = require("../auth/provider/hash.provider");
const client_1 = require("@prisma/client");
const exceljs_1 = __importDefault(require("exceljs"));
const class_validator_1 = require("class-validator");
let UserService = UserService_1 = class UserService {
    constructor(prismaService, hashProvider) {
        this.prismaService = prismaService;
        this.hashProvider = hashProvider;
        this.logger = new common_1.Logger(UserService_1.name);
    }
    async create(createUserDto) {
        createUserDto.password = await this.hashProvider.hashPassword(createUserDto.password);
        return this.prismaService.user.create({
            data: {
                ...createUserDto,
                organizationId: createUserDto.organizationId,
            },
        });
    }
    async findAll(filterUserDto) {
        const { organizationId, name, email, is_verified, phone, role, page = 1, take = 10, } = filterUserDto;
        const where = {
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
    async findOneById(id) {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: id,
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        return user;
    }
    async update(id, updateUserDto, user) {
        const requestedUser = await this.prismaService.user.findUnique({
            where: { id },
        });
        if (!requestedUser) {
            throw new common_1.NotFoundException('User not found');
        }
        if (requestedUser.organizationId !== user.organizationId ||
            (user.role !== client_1.Role.SUPER_MANAGER && user.role !== client_1.Role.MANAGER)) {
            throw new common_1.ForbiddenException('You do not have permission to update this user');
        }
        if (updateUserDto.password) {
            updateUserDto.password = await this.hashProvider.hashPassword(updateUserDto.password);
        }
        try {
            return await this.prismaService.user.update({
                where: { id },
                data: updateUserDto,
            });
        }
        catch (error) {
            this.logger.error(error);
            throw new common_1.BadRequestException('Failed to update user');
        }
    }
    async remove(id, user) {
        const requestedUser = await this.prismaService.user.findUnique({
            where: { id },
        });
        if (!requestedUser) {
            throw new common_1.NotFoundException('User not found');
        }
        if (requestedUser.organizationId !== user.organizationId ||
            (user.role !== client_1.Role.SUPER_MANAGER && user.role !== client_1.Role.MANAGER)) {
            throw new common_1.ForbiddenException('You do not have permission to delete this user');
        }
        return await this.prismaService.user.delete({
            where: {
                id: id,
            },
        });
    }
    async createAgent(createUserDto) {
        try {
            return await this.prismaService.user.create({
                data: {
                    ...createUserDto,
                    role: client_1.Role.AGENT,
                },
            });
        }
        catch (error) {
            this.logger.error(error);
            throw new common_1.BadRequestException('Failed to create agent');
        }
        finally {
            await this.prismaService.$disconnect();
        }
    }
    async findAllAgent(organizationId) {
        try {
            return await this.prismaService.user.findMany({
                where: {
                    role: client_1.Role.AGENT,
                    organizationId,
                },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error);
        }
        finally {
            await this.prismaService.$disconnect();
        }
    }
    async createManager(createUserDto) {
        try {
            return await this.prismaService.user.create({
                data: {
                    ...createUserDto,
                    role: client_1.Role.MANAGER,
                },
            });
        }
        catch (error) {
            this.logger.error(error);
            throw new common_1.BadRequestException('Failed to create manager');
        }
        finally {
            await this.prismaService.$disconnect();
        }
    }
    async createAgents(createUserDto) {
        try {
            return await this.prismaService.user.createMany({
                data: createUserDto,
            });
        }
        catch (error) {
            this.logger.error(error);
            throw new common_1.BadRequestException('Failed to create agents');
        }
        finally {
            await this.prismaService.$disconnect();
        }
    }
    async readCsv(file, organizationId) {
        if (!file || !file.buffer) {
            throw new common_1.BadRequestException('Invalid file upload');
        }
        try {
            const csvData = file.buffer.toString();
            const rows = csvData.split('\n');
            if (rows.length < 2) {
                throw new common_1.BadRequestException('CSV file is empty or invalid');
            }
            const headers = rows[0]
                .split(',')
                .map((header) => header.trim().toUpperCase());
            const requiredColumns = ['NAME', 'EMAIL'];
            const missingColumns = requiredColumns.filter((col) => !headers.includes(col));
            if (missingColumns.length) {
                throw new common_1.BadRequestException(`Missing required columns: ${missingColumns.join(', ')}`);
            }
            console.log(rows.length);
            if (rows.length > 102) {
                throw new common_1.UnprocessableEntityException('Maximum 100 rows allowed');
            }
            const data = [];
            const emailSet = new Set();
            for (let i = 1; i < rows.length; i++) {
                const csvRowData = rows[i].split(',');
                const rowData = {};
                headers.forEach((header, index) => {
                    rowData[header] = csvRowData[index]?.trim() || '';
                });
                if (!(0, class_validator_1.isEmail)(rowData['EMAIL'])) {
                    throw new common_1.BadRequestException(`Invalid email format at row ${i + 1}`);
                }
                if (emailSet.has(rowData['EMAIL'])) {
                    throw new common_1.BadRequestException(`Duplicate email found at row ${i + 1}`);
                }
                emailSet.add(rowData['EMAIL']);
                data.push({
                    name: rowData['NAME'],
                    email: rowData['EMAIL'],
                    password: await this.hashProvider.hashPassword(organizationId),
                    organizationId,
                    role: client_1.Role.AGENT,
                });
            }
            return await this.prismaService.user.createMany({
                data,
            });
        }
        catch (error) {
            this.logger.error('CSV processing failed:', error);
            console.log(error);
            if (error.code === 'P2002')
                throw new common_1.UnprocessableEntityException('Duplicate email found');
            throw error instanceof common_1.BadRequestException ||
                error instanceof common_1.UnprocessableEntityException
                ? error
                : new common_1.InternalServerErrorException('Failed to process CSV file');
        }
    }
    async readExcelSheet(file, organizationId) {
        if (!file || !file.buffer) {
            throw new common_1.BadRequestException('Invalid file upload');
        }
        try {
            const workbook = new exceljs_1.default.Workbook();
            await workbook.xlsx.load(file.buffer);
            const worksheet = workbook.getWorksheet(1);
            if (!worksheet || worksheet.rowCount < 2) {
                throw new common_1.BadRequestException('Excel sheet is empty or invalid');
            }
            const headers = worksheet.getRow(1).values.map((header) => header?.toString().trim().toUpperCase());
            const requiredColumns = ['NAME', 'EMAIL'];
            const missingColumns = requiredColumns.filter((col) => !headers.includes(col));
            if (missingColumns.length) {
                throw new common_1.BadRequestException(`Missing required columns: ${missingColumns.join(', ')}`);
            }
            const rows = [];
            const emailSet = new Set();
            if (worksheet.rowCount > 101) {
                throw new common_1.UnprocessableEntityException('Maximum 100 rows allowed');
            }
            for (let i = 2; i <= worksheet.rowCount; i++) {
                const row = worksheet.getRow(i).values;
                const rowData = {};
                headers.forEach((header, index) => {
                    const value = row[index]?.toString().trim() || '';
                    rowData[header] = value;
                });
                if (!(0, class_validator_1.isEmail)(rowData['EMAIL'].trim())) {
                    console.log(rowData);
                    throw new common_1.BadRequestException(`Invalid email format at row ${i}`);
                }
                if (emailSet.has(rowData['EMAIL'])) {
                    throw new common_1.BadRequestException(`Duplicate email found at row ${i}`);
                }
                emailSet.add(rowData['EMAIL']);
                rows.push({
                    name: rowData['NAME'],
                    email: rowData['EMAIL'],
                    password: await this.hashProvider.hashPassword(organizationId),
                    organizationId,
                    role: client_1.Role.AGENT,
                });
            }
            const MAX_ROWS = 100;
            if (rows.length > MAX_ROWS) {
                throw new common_1.BadRequestException(`Maximum ${MAX_ROWS} rows allowed`);
            }
            const res = await this.prismaService.user.createMany({
                data: rows,
            });
            return res;
        }
        catch (error) {
            this.logger.error('Excel sheet processing failed:', error);
            throw error instanceof common_1.BadRequestException ||
                error instanceof common_1.UnprocessableEntityException
                ? error
                : new common_1.InternalServerErrorException('Failed to process Excel sheet');
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        hash_provider_1.Hash])
], UserService);
//# sourceMappingURL=user.service.js.map