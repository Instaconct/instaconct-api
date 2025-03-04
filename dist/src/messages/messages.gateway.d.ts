import { OnGatewayInit } from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { Server } from 'http';
import { Socket } from 'socket.io';
import { OrganizationService } from 'src/organization/organization.service';
import { TicketService } from 'src/ticket/ticket.service';
import { Jwt } from 'src/auth/provider/jwt.provider';
import { joinConversationDto } from './dto/join-ticket.dto';
import { UserService } from 'src/user/user.service';
export declare class MessagesGateway implements OnGatewayInit {
    private readonly messagesService;
    private readonly organizationService;
    private readonly ticketService;
    private readonly userService;
    private readonly jwtProvider;
    private readonly logger;
    constructor(messagesService: MessagesService, organizationService: OrganizationService, ticketService: TicketService, userService: UserService, jwtProvider: Jwt);
    afterInit(socket: Socket): Promise<void>;
    server: Server;
    handleJoin(socket: Socket, content: joinConversationDto): Promise<void>;
    handleMessage(client: Socket, message: string): Promise<void>;
    handleTyping(socket: Socket): void;
    handleEndConversation(socket: Socket): Promise<void>;
}
