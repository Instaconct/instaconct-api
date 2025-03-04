"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MessagesGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const messages_service_1 = require("./messages.service");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const organization_service_1 = require("../organization/organization.service");
const auth_ws_middleware_1 = require("./middleware/auth-ws.middleware");
const ticket_service_1 = require("../ticket/ticket.service");
const jwt_provider_1 = require("../auth/provider/jwt.provider");
const join_ticket_dto_1 = require("./dto/join-ticket.dto");
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
const ws_exception_filter_1 = require("../filters/ws-exception.filter");
const client_1 = require("@prisma/client");
let MessagesGateway = MessagesGateway_1 = class MessagesGateway {
    constructor(messagesService, organizationService, ticketService, userService, jwtProvider) {
        this.messagesService = messagesService;
        this.organizationService = organizationService;
        this.ticketService = ticketService;
        this.userService = userService;
        this.jwtProvider = jwtProvider;
        this.logger = new common_1.Logger(MessagesGateway_1.name);
    }
    async afterInit(socket) {
        socket.use((0, auth_ws_middleware_1.AuthWsMiddleware)(this.organizationService, this.userService, this.jwtProvider));
    }
    async handleJoin(socket, content) {
        try {
            console.log('join-conversation', content);
            const { ticketId } = content;
            const { organizationId, user } = socket.data;
            const ticket = await this.ticketService.findOne(ticketId, organizationId);
            if (!ticket) {
                throw new websockets_1.WsException('Ticket not found');
            }
            socket.data.ticketId = ticket.id;
            socket.join(ticket.id);
            if (user) {
                socket.to(ticket.id).emit('userJoined', user);
                this.logger.log(`User ${user.id} joined conversati on ${ticket.id}`);
            }
            else {
                socket.data.user = ticket.customer;
                socket.to(ticket.id);
            }
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
    async handleMessage(client, message) {
        const { ticketId, user } = client.data;
        if (!user || !ticketId) {
            throw new websockets_1.WsException('Unauthorized');
        }
        const newMessage = await this.messagesService.create({
            ticketId,
            senderId: user.role ? user.id : null,
            customerId: user.role ? null : user.id,
            senderType: user.role ? client_1.SenderType.AGENT : client_1.SenderType.CUSTOMER,
            content: message,
        });
        console.log(newMessage);
        client.to(ticketId).emit('message', {
            ...newMessage,
            sender: user,
        });
    }
    handleTyping(socket) {
        const { user, ticketId } = socket.data;
        if (!user) {
            return;
        }
        socket.to(ticketId).emit('typing', {
            userId: user.id,
            isTyping: true,
        });
    }
    async handleEndConversation(socket) {
        try {
            const { ticketId, user } = socket.data;
            if (!user || !ticketId) {
                throw new websockets_1.WsException('Unauthorized');
            }
            if (!user.role || user.role === 'CUSTOMER') {
                throw new websockets_1.WsException('Unauthorized: Only agents can close tickets');
            }
            const closedTicket = await this.ticketService.closeTicket(ticketId);
            socket.to(ticketId).emit('conversation-ended', {
                ticketId,
                closedBy: user,
                closedAt: closedTicket.closedAt,
            });
            socket.leave(ticketId);
            this.logger.debug('conversation ended successfully');
            this.logger.log(`User ${user.id} left conversation ${ticketId}`);
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
};
exports.MessagesGateway = MessagesGateway;
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "afterInit", null);
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", http_1.Server)
], MessagesGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-conversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        join_ticket_dto_1.joinConversationDto]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('end-conversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleEndConversation", null);
exports.MessagesGateway = MessagesGateway = MessagesGateway_1 = __decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        transform: true,
        exceptionFactory(validationErrors = []) {
            if (this.isDetailedOutputDisabled) {
                return new websockets_1.WsException('Bad request');
            }
            const errors = this.flattenValidationErrors(validationErrors);
            console.log('from pipe', errors);
            throw new websockets_1.WsException(errors);
        },
    })),
    (0, common_1.UseFilters)(new ws_exception_filter_1.WebSocketExceptionFilter()),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        transports: ['websocket', 'polling'],
    }),
    __metadata("design:paramtypes", [messages_service_1.MessagesService,
        organization_service_1.OrganizationService,
        ticket_service_1.TicketService,
        user_service_1.UserService,
        jwt_provider_1.Jwt])
], MessagesGateway);
//# sourceMappingURL=messages.gateway.js.map