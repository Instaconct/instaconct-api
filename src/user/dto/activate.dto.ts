import { IsString, IsNotEmpty } from 'class-validator';

export class ActivateDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
