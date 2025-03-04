import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Hash } from 'src/auth/provider/hash.provider';
import { FilterUserDto } from './dto/filter-user.dto';
import { Prisma, User } from '@prisma/client';
export declare class UserService {
    private readonly prismaService;
    private readonly hashProvider;
    private readonly logger;
    constructor(prismaService: PrismaService, hashProvider: Hash);
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
        email: string;
        password: string | null;
        organizationId: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        is_verified: boolean;
        token: string | null;
        token_expires_at: Date | null;
    }>;
    findAll(filterUserDto: FilterUserDto): Promise<{
        data: {
            id: string;
            name: string;
            created_at: Date;
            updated_at: Date;
            email: string;
            password: string | null;
            organizationId: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.Role;
            is_verified: boolean;
            token: string | null;
            token_expires_at: Date | null;
        }[];
        meta: {
            total: number;
            page: number;
            take: number;
            pageCount: number;
        };
    }>;
    findOneById(id: string): Promise<{
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
        email: string;
        password: string | null;
        organizationId: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        is_verified: boolean;
        token: string | null;
        token_expires_at: Date | null;
    }>;
    update(id: string, updateUserDto: UpdateUserDto, user: User): Promise<{
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
        email: string;
        password: string | null;
        organizationId: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        is_verified: boolean;
        token: string | null;
        token_expires_at: Date | null;
    }>;
    remove(id: string, user: User): Promise<{
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
        email: string;
        password: string | null;
        organizationId: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        is_verified: boolean;
        token: string | null;
        token_expires_at: Date | null;
    }>;
    createAgent(createUserDto: CreateUserDto): Promise<{
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
        email: string;
        password: string | null;
        organizationId: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        is_verified: boolean;
        token: string | null;
        token_expires_at: Date | null;
    }>;
    findAllAgent(organizationId: string): Promise<{
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
        email: string;
        password: string | null;
        organizationId: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        is_verified: boolean;
        token: string | null;
        token_expires_at: Date | null;
    }[]>;
    createManager(createUserDto: CreateUserDto): Promise<{
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
        email: string;
        password: string | null;
        organizationId: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        is_verified: boolean;
        token: string | null;
        token_expires_at: Date | null;
    }>;
    createAgents(createUserDto: CreateUserDto[]): Promise<Prisma.BatchPayload>;
    readCsv(file: Express.Multer.File, organizationId: string): Promise<Prisma.BatchPayload>;
    readExcelSheet(file: Express.Multer.File, organizationId: string): Promise<Prisma.BatchPayload>;
}
