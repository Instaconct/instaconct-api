import { Organization, Role } from '@prisma/client';
export declare class RegisterDto {
    name: string;
    email: string;
    phone: string;
    password: string;
    organization: Organization;
    role: Role;
}
