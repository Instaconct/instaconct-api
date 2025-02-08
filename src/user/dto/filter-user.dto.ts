import { Role } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { IsULID } from 'src/shared/decorator/is-ulid.decorator';
import { PaginatedRequestDto } from 'src/shared/paginated-request.dto';

export class FilterUserDto extends PaginatedRequestDto {
  @IsULID()
  organizationId: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsEnum(Role)
  @IsOptional()
  role: Role;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value.toString() === 'true')
  is_verified: boolean;

  @IsString()
  @IsOptional()
  phone: string;
}
