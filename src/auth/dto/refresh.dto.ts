import { IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshDto {
  @IsJWT()
  @IsNotEmpty()
  refreshToken: string;

  @IsJWT()
  @IsNotEmpty()
  accessToken: string;
}
