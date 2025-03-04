import { Role } from '@prisma/client';
import { PaginatedRequestDto } from 'src/shared/paginated-request.dto';
export declare class FilterUserDto extends PaginatedRequestDto {
    organizationId: string;
    email: string;
    name: string;
    role: Role;
    is_verified: boolean;
    phone: string;
}
