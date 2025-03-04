import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
export declare class OrganizationService {
    private readonly prismaService;
    private readonly logger;
    constructor(prismaService: PrismaService);
    findOne(id: string, user?: User): Promise<{
        id: string;
        name: string;
        website: string | null;
        default_lang: string | null;
        created_at: Date;
        updated_at: Date;
        timezone: string | null;
    }>;
    update(id: string, updateOrganizationDto: UpdateOrganizationDto, user: User): Promise<{
        id: string;
        name: string;
        website: string | null;
        default_lang: string | null;
        created_at: Date;
        updated_at: Date;
        timezone: string | null;
    }>;
}
