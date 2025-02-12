import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  ConnectedSocket,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { Server } from 'http';
import { Socket } from 'socket.io';
import { OrganizationService } from 'src/organization/organization.service';
import { AuthWsMiddleware } from './middleware/auth-ws.middleware';
import { TicketService } from 'src/ticket/ticket.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket', 'polling'],
})
export class MessagesGateway implements OnGatewayInit {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly organizationService: OrganizationService,
    private readonly ticketService: TicketService,
  ) {}

  async afterInit(@ConnectedSocket() socket: Socket) {
    socket.use(AuthWsMiddleware(this.organizationService) as any);
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('new-ticket')
  handleEvent(@MessageBody() data: string): string {
    return data;
  }

  @SubscribeMessage('typing')
  handleTyping(socket: Socket, conversationId: string) {
    const { user } = socket.data;
    if (!user) {
      return;
    }
    socket.to(conversationId).emit('typing', {
      userId: user.id,
      isTyping: true,
    });

    // Automatically reset after 3 seconds
    setTimeout(() => {
      socket.to(conversationId).emit('typing', {
        userId: user.id,
        isTyping: false,
      });
    }, 3000);
  }

  // Agent can only access org conversations
  @SubscribeMessage('joinConversation')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() content: { ticketId: string },
  ) {
    try {
      console.log('joinConversation', content);
      const conversation = await this.ticketService.findOne(
        content[0].ticketId,
      );
      if (
        !conversation ||
        conversation.organizationId !== client.data.organization.id
      ) {
        client.emit('error', { message: 'Access denied to this conversation' });
        return;
      }
      client.data.ticketId = content[0].ticketId;
      console.log('joinConversation', conversation);
      client.join(content[0].ticketId);
      client.to(content[0].ticketId).emit('joined_conversation');
    } catch (error) {
      console.error(error);
      client.emit('error', { message: 'Failed to join conversation' });
    }
  }

  @SubscribeMessage('message')
  async handleMessage(socket: Socket, _message: string) {
    console.log('message', socket.data.ticketId);
    const { user, organization } = socket.data;
    if (!user || !organization) {
      return;
    }
    // const newMessage = await this.messagesService.create({
    //   content: message,
    //   organizationId: organization.id,
    //   userId: user.id,
    // });
    // return socket.to(newMessage.conversationId).emit('message', newMessage);
  }
}
