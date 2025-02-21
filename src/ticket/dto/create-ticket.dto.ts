import { IsObject, ValidateNested } from 'class-validator';
import { User } from '@prisma/client';
import { CreateCustomerDto } from './create-customer.dto';
import { Type } from 'class-transformer';

export class CreateTicketDto {
  @IsObject()
  @ValidateNested()
  @Type(() => CreateCustomerDto)
  customer: User;
}
