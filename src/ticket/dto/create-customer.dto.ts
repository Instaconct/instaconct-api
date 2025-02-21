import {
  IsString,
  IsEmail,
  IsOptional,
  Length,
  IsNotEmpty,
  IsPhoneNumber,
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

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;
}
