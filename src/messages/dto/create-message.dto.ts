import { SenderType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { IsULID } from 'src/shared/decorator/is-ulid.decorator';

export class CreateMessageDto {
  @IsULID()
  @IsOptional()
  @ValidateIf((o) => !o.customerId)
  senderId?: string;

  @IsULID()
  @IsOptional()
  @ValidateIf((o) => !o.senderId)
  customerId?: string;

  @IsULID()
  ticketId: string;

  @IsString()
  content: string;

  @IsEnum(SenderType)
  senderType: SenderType;
}
