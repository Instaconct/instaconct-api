import { Transform } from 'class-transformer';
import { IsInt, IsPositive, Max } from 'class-validator';

export class PaginatedRequestDto {
  @IsInt({ message: 'Page must be an integer' })
  @IsPositive({ message: 'Page must be a positive integer' })
  @Transform(({ value }) => parseInt(value))
  page = 1;

  @IsInt({ message: 'Take must be an integer' })
  @IsPositive({ message: 'Take must be a positive integer' })
  @Max(20, { message: 'Take cannot exceed 20' })
  @Transform(({ value }) => parseInt(value))
  take = 20;
}
