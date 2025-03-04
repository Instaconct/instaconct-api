import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Request } from 'express';
import { User } from '@prisma/client';
export declare class TicketController {
    private readonly ticketService;
    constructor(ticketService: TicketService);
    create(createTicketDto: CreateTicketDto, req: Request): Promise<{
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
    findAll(userInfo: User): Promise<({
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
    findOne(ticketId: string, userInfo: User): Promise<{
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
    findMessages(ticketId: string, userInfo: User): Promise<({
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
