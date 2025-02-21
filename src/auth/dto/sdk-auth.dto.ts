import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SdkAuthDto {
  @IsString()
  @IsNotEmpty()
  @Length(25)
  private_key: string;
}
