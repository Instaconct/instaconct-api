import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Jwt } from 'src/auth/provider/jwt.provider';
export declare class TicketService {
    private readonly prismaService;
    private readonly jwtProvider;
    constructor(prismaService: PrismaService, jwtProvider: Jwt);
    create(createTicketDto: CreateTicketDto, organizationId: string): Promise<{
        ticketId: string;
        customer: {
            id: string;
            name: string;
            created_at: Date;
            updated_at: Date;
            email: string | null;
            organizationId: string;
            phone: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        };
    }>;
    findAll(organizationId: string): Promise<({
        organization: {
            id: string;
            name: string;
            website: string | null;
            default_lang: string | null;
            created_at: Date;
            updated_at: Date;
            timezone: string | null;
        };
        customer: {
            id: string;
            name: string;
            created_at: Date;
            updated_at: Date;
            email: string | null;
            organizationId: string;
            phone: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        };
    } & {
        id: string;
        organizationId: string;
        customerId: string;
        createdAt: Date;
        updatedAt: Date;
        closedAt: Date | null;
        status: import("@prisma/client").$Enums.TicketStatus;
    })[]>;
    findOne(id: string, organizationId: string): Promise<{
        organization: {
            id: string;
            name: string;
            website: string | null;
            default_lang: string | null;
            created_at: Date;
            updated_at: Date;
            timezone: string | null;
        };
        customer: {
            id: string;
            name: string;
            created_at: Date;
            updated_at: Date;
            email: string | null;
            organizationId: string;
            phone: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        };
    } & {
        id: string;
        organizationId: string;
        customerId: string;
        createdAt: Date;
        updatedAt: Date;
        closedAt: Date | null;
        status: import("@prisma/client").$Enums.TicketStatus;
    }>;
    closeTicket(ticketId: string): Promise<{
        id: string;
        organizationId: string;
        customerId: string;
        createdAt: Date;
        updatedAt: Date;
        closedAt: Date | null;
        status: import("@prisma/client").$Enums.TicketStatus;
    }>;
    findMessages(ticketId: string, organizationId: string): Promise<({
        customer: {
            id: string;
            name: string;
            created_at: Date;
            updated_at: Date;
            email: string | null;
            organizationId: string;
            phone: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        };
        sender: {
            id: string;
            name: string;
            created_at: Date;
            updated_at: Date;
            email: string;
            password: string | null;
            organizationId: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.Role;
            is_verified: boolean;
            token: string | null;
            token_expires_at: Date | null;
        };
    } & {
        id: string;
        senderId: string | null;
        customerId: string | null;
        ticketId: string;
        content: string;
        senderType: import("@prisma/client").$Enums.SenderType;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
}
