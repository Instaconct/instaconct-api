import { Role } from '@prisma/client';
import {
  IsString,
  IsEmail,
  IsOptional,
  Length,
  IsNotEmpty,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @Length(1, 255)
  email: string;

  @IsString()
  @IsOptional()
  @Length(1, 255)
  phone?: string;

  role: Role = Role.CUSTOMER;
}
