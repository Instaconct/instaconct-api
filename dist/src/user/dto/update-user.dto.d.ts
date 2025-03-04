import { CreateUserDto } from './create-user.dto';
import { Role } from '@prisma/client';
declare const UpdateUserDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
    role: Role;
    organizationId?: string;
    is_active?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export {};
