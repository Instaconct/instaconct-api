import { Organization, Role } from '@prisma/client';
import {
  IsString,
  MaxLength,
  IsEmail,
  IsNotEmpty,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { CreateOrganizationDto } from 'src/organization/dto/create-organization.dto';
import { Type } from 'class-transformer';

export class RegisterDto {
  @IsString()
  @MaxLength(30)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsObject()
  @ValidateNested()
  @Type(() => CreateOrganizationDto)
  organization: Organization;

  role: Role;
}
