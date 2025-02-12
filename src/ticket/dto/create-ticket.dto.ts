import {
  IsString,
  IsNotEmpty,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { User } from '@prisma/client';
import { CreateCustomerDto } from './create-customer.dto';
import { Type } from 'class-transformer';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @IsObject()
  @ValidateNested()
  @Type(() => CreateCustomerDto)
  customer: User;
}
