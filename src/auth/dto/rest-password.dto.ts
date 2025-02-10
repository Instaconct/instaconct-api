import { IsNotEmpty, IsString } from 'class-validator';

export class RestPasswordDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
