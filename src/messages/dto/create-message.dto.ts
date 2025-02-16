import { SenderType } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';
import { IsULID } from 'src/shared/decorator/is-ulid.decorator';

export class CreateMessageDto {
  @IsULID()
  senderId: string;

  @IsULID()
  ticketId: string;

  @IsString()
  content: string;

  @IsEnum(SenderType)
  senderType: SenderType;
}
