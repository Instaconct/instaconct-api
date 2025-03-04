import { OrganizationService } from './organization.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { User } from '@prisma/client';
export declare class OrganizationController {
    private readonly organizationService;
    constructor(organizationService: OrganizationService);
    findOne(id: string, user: User): Promise<{
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
