import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class MessagesService {
    private readonly PrismaService;
    constructor(PrismaService: PrismaService);
    create(createMessageDto: CreateMessageDto): Promise<{
        id: string;
        senderId: string | null;
        customerId: string | null;
        ticketId: string;
        content: string;
        senderType: import("@prisma/client").$Enums.SenderType;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(tickedId: string): Promise<{
        id: string;
        senderId: string | null;
        customerId: string | null;
        ticketId: string;
        content: string;
        senderType: import("@prisma/client").$Enums.SenderType;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    update(id: string, updateMessageDto: UpdateMessageDto): import("@prisma/client").Prisma.Prisma__MessageClient<{
        id: string;
        senderId: string | null;
        customerId: string | null;
        ticketId: string;
        content: string;
        senderType: import("@prisma/client").$Enums.SenderType;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__MessageClient<{
        id: string;
        senderId: string | null;
        customerId: string | null;
        ticketId: string;
        content: string;
        senderType: import("@prisma/client").$Enums.SenderType;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
