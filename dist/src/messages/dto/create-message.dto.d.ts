import { SenderType } from '@prisma/client';
export declare class CreateMessageDto {
    senderId?: string;
    customerId?: string;
    ticketId: string;
    content: string;
    senderType: SenderType;
}
