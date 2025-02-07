import {
  IsOptional,
  IsString,
  IsTimeZone,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @MaxLength(30)
  name: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsTimeZone()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  defaultLanguage?: string;
}
