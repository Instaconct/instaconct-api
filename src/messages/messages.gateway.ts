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
import { Server } from 'http';
import { Socket } from 'socket.io';
import { OrganizationService } from 'src/organization/organization.service';
import { AuthWsMiddleware } from './middleware/auth-ws.middleware';
import { TicketService } from 'src/ticket/ticket.service';
import { Jwt } from 'src/auth/provider/jwt.provider';
import { joinConversationDto } from './dto/join-ticket.dto';
import {
  BadRequestException,
  Logger,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { WebSocketExceptionFilter } from 'src/filters/ws-exception.filter';

@UsePipes(
  new ValidationPipe({
    // transform: true,
    exceptionFactory(validationErrors = []) {
      if (this.isDetailedOutputDisabled) {
        return new WsException('Bad request');
      }

      const errors = this.flattenValidationErrors(validationErrors);
      console.log(errors);
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
export class MessagesGateway implements OnGatewayInit {
  private readonly logger = new Logger(MessagesGateway.name);

  constructor(
    private readonly messagesService: MessagesService,
    private readonly organizationService: OrganizationService,
    private readonly ticketService: TicketService,
    private readonly userService: UserService,
    private readonly jwtProvider: Jwt,
  ) {}

  async afterInit(@ConnectedSocket() socket: Socket) {
    socket.use(AuthWsMiddleware(this.ticketService, this.jwtProvider) as any);
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinConversation')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() content: joinConversationDto,
  ) {
    throw new WsException('Invalid credentials.');
    try {
      console.log('joinConversation', content);
      const { userId } = content;
      const { tickets, ...user } =
        await this.userService.findOneByIdAndTicketOpen(userId);
      if (!user || user instanceof BadRequestException) {
        throw new WsException('User not found');
      }
      const { ticketId } = client.data;

      if (!ticketId || ticketId !== tickets[0].id) {
        throw new WsException('Unauthorized');
      }

      client.data.user = user;
      client.join(tickets[0].id);
      client.to(tickets[0].id).emit('userJoined', user);
      this.logger.log(`User ${user.id} joined conversation ${tickets[0].id}`);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: string,
  ) {
    const { ticketId, user } = client.data;

    if (!user || !ticketId) {
      throw new WsException('Unauthorized');
    }

    const newMessage = await this.messagesService.create({
      ticketId,
      senderId: user.id,
      senderType: user.role,
      content: message,
    });

    console.log(newMessage);

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

    // Automatically reset after 3 seconds
    setTimeout(() => {
      socket.to(ticketId).emit('typing', {
        userId: user.id,
        isTyping: false,
      });
    }, 3000);
  }
}
