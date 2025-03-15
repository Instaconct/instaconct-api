import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  ConnectedSocket,
  SubscribeMessage,
  WsException,
  MessageBody,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { Socket, Server } from 'socket.io';
import { OrganizationService } from 'src/organization/organization.service';
import { AuthWsMiddleware } from './middleware/auth-ws.middleware';
import { TicketService } from 'src/ticket/ticket.service';
import { Jwt } from 'src/auth/provider/jwt.provider';
import { joinConversationDto } from './dto/join-ticket.dto';
import {
  Logger,
  OnModuleInit,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { WebSocketExceptionFilter } from 'src/filters/ws-exception.filter';
import { Message, SenderType, TicketSource } from '@prisma/client';
import { MetaMessengerService } from 'src/meta/meta-messenger.service';
import { ModuleRef } from '@nestjs/core';

@UsePipes(
  new ValidationPipe({
    transform: true,
    exceptionFactory(validationErrors = []) {
      if (this.isDetailedOutputDisabled) {
        return new WsException('Bad request');
      }

      const errors = this.flattenValidationErrors(validationErrors);
      console.log('from pipe', errors);
      throw new WsException(errors);
    },
  }),
)
@UseFilters(new WebSocketExceptionFilter())
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket', 'polling'],
})
export class MessagesGateway implements OnGatewayInit, OnModuleInit {
  private readonly logger = new Logger(MessagesGateway.name);
  private metaMessengerService: MetaMessengerService;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly organizationService: OrganizationService,
    private readonly ticketService: TicketService,
    private readonly userService: UserService,
    private readonly jwtProvider: Jwt,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    if (!this.metaMessengerService) {
      this.metaMessengerService = this.moduleRef.get(MetaMessengerService, {
        strict: false,
      });
    }
  }

  async afterInit(@ConnectedSocket() socket: Socket) {
    socket.use(
      AuthWsMiddleware(
        this.organizationService,
        this.userService,
        this.jwtProvider,
      ) as any,
    );
  }

  @WebSocketServer()
  server: Server;

  /**
   *
   * @param socket
   * @param content
   * socket data if user is authenticated will have user info and organization id in socket.data
   * if sdk will have organization info in socket.data
   */
  @SubscribeMessage('join-conversation')
  async handleJoin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() content: joinConversationDto,
  ) {
    try {
      console.log('join-conversation', content);
      const { ticketId } = content;
      const { organizationId, user } = socket.data;
      const ticket = await this.ticketService.findOne(ticketId, organizationId);
      if (!ticket) {
        throw new WsException('Ticket not found');
      }
      socket.data.ticketId = ticket.id;
      socket.data.ticket = ticket;

      socket.join(ticket.id);

      if (user) {
        await this.ticketService.assignAgent(ticket.id, user.id);
        socket.to(ticket.id).emit('userJoined', user);
        this.logger.log(`User ${user.id} joined conversati on ${ticket.id}`);
      } else {
        socket.data.user = ticket.customer;
        socket.to(ticket.id);
      }
    } catch (error) {
      this.logger.error('Error joining conversation', error);
      throw error;
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: string,
  ) {
    const { ticketId, user, ticket } = client.data;

    if (!user || !ticketId) {
      throw new WsException('Unauthorized');
    }

    const newMessage = await this.messagesService.create({
      ticketId,
      senderId: user.role ? user.id : null,
      customerId: user.role ? null : user.id,
      senderType: user.role ? SenderType.AGENT : SenderType.CUSTOMER,
      content: message,
    });

    if (ticket.source === TicketSource.FACEBOOK && user.role) {
      this.metaMessengerService.handleOutgoingMessage(
        ticketId,
        newMessage.content,
      );
      return;
    }

    client.to(ticketId).emit('message', {
      ...newMessage,
      sender: user,
    });
  }

  @SubscribeMessage('typing')
  handleTyping(socket: Socket) {
    const { user, ticketId } = socket.data;
    if (!user) {
      return;
    }

    socket.to(ticketId).emit('typing', {
      userId: user.id,
      isTyping: true,
    });
  }

  @SubscribeMessage('end-conversation')
  async handleEndConversation(@ConnectedSocket() socket: Socket) {
    try {
      const { ticketId, user } = socket.data;

      if (!user || !ticketId) {
        throw new WsException('Unauthorized');
      }

      // Only agents can close tickets
      if (!user.role) {
        throw new WsException('Unauthorized: Only agents can close tickets');
      }

      const closedTicket = await this.ticketService.closeTicket(ticketId);

      // Notify all users in the room that the conversation has ended
      socket.to(ticketId).emit('conversation-ended', {
        ticketId,
        closedBy: user,
        closedAt: closedTicket.closedAt,
      });

      // Leave the room
      socket.leave(ticketId);

      this.logger.debug('conversation ended successfully');
      this.logger.log(`User ${user.id} left conversation ${ticketId}`);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // helper function to emit a message to a room
  emitMessageToRoom(roomId: string, message: Message) {
    try {
      this.logger.debug(`Emitting message to room ${roomId}`);

      this.server.to(roomId).emit('message', message);
    } catch (error) {
      this.logger.error('Error emitting message to room', error);
    }
  }
}
