import { IsULID } from 'src/shared/decorator/is-ulid.decorator';

export class joinConversationDto {
  @IsULID()
  ticketId: string;
}
