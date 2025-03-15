import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessagesService } from 'src/messages/messages.service';
import {
  MetaPlatform,
  SenderType,
  TicketSource,
  TicketStatus,
} from '@prisma/client';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WebhookMessageData } from './interfaces/message.interface';
import { ConfigService } from '@nestjs/config';
import { MessagesGateway } from 'src/messages/messages.gateway';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class MetaMessengerService implements OnModuleInit {
  private readonly logger = new Logger(MetaMessengerService.name);
  private readonly META_VERSION_API = 'v22.0';
  private messagesGateway: MessagesGateway;

  constructor(
    private readonly prisma: PrismaService,
    private readonly messagesService: MessagesService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly moduleRef: ModuleRef,
  ) {
    this.META_VERSION_API = this.configService.get('META_VERSION_API');
  }
  onModuleInit() {
    if (!this.messagesGateway) {
      this.messagesGateway = this.moduleRef.get(MessagesGateway, {
        strict: false,
      });
    }
  }

  async handleFacebookMessage(messaging: WebhookMessageData): Promise<void> {
    this.logger.debug('FACEBOOK RECEIVED MESSAGE', messaging);
    const senderId = messaging.sender.id;
    const pageId = messaging.recipient.id;
    const messageText = messaging.message?.text;

    if (!messageText) return;

    const pageConnection = await this.prisma.metaPageConnection.findFirst({
      where: {
        pageId: pageId,
      },
    });

    if (!pageConnection) return;

    // Find or create customer
    let customer = await this.prisma.customer.findFirst({
      where: {
        metadata: {
          path: '$.facebook_id',
          equals: senderId,
        },
        organizationId: pageConnection.organizationId,
      },
    });

    if (!customer) {
      const userInfo = await this.getFacebookUserInfo(senderId, pageId);

      customer = await this.prisma.customer.create({
        data: {
          name: userInfo.name || 'Facebook User',
          email: userInfo.email,
          organizationId: pageConnection.organizationId,
          metadata: {
            facebook_id: senderId,
            platform: MetaPlatform.FACEBOOK,
          },
        },
      });
    }

    // Find or create ticket
    let ticket = await this.prisma.ticket.findFirst({
      where: {
        customerId: customer.id,
        status: {
          in: [TicketStatus.OPEN, TicketStatus.ASSIGNED],
        },
      },
    });

    if (!ticket) {
      ticket = await this.prisma.ticket.create({
        data: {
          organization: { connect: { id: pageConnection.organizationId } },
          customer: { connect: { id: customer.id } },
          source: TicketSource.FACEBOOK,
        },
      });
    }

    const newMessage = await this.messagesService.create({
      content: messageText,
      ticketId: ticket.id,
      customerId: customer.id,
      senderType: SenderType.CUSTOMER,
    });

    this.messagesGateway.emitMessageToRoom(ticket.id, newMessage);
  }

  async handleInstagramMessage(_messaging: WebhookMessageData): Promise<void> {
    // Similar implementation to Facebook but for Instagram
    // ...
  }

  async sendFacebookMessage(
    pageId: string,
    recipientId: string,
    message: string,
  ): Promise<any> {
    const pageConnection = await this.prisma.metaPageConnection.findFirst({
      where: {
        pageId: pageId,
      },
    });

    if (!pageConnection) throw new Error('Page not found');

    const pageAccessToken = await this.getStoredPageAccessToken(pageId);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://graph.facebook.com/${this.META_VERSION_API}/${pageConnection.pageId}/messages`,
          {
            recipient: { id: recipientId },
            message: { text: message },
            messaging_type: 'RESPONSE',
            access_token: pageAccessToken,
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error('SEND FACEBOOK MESSAGE ERROR', {
        response: error.response?.data,
        error: error.message,
      });
    }
  }

  private async getFacebookUserInfo(
    userId: string,
    pageId: string,
  ): Promise<any> {
    const pageAccessToken = await this.getStoredPageAccessToken(pageId);

    const response = await firstValueFrom(
      this.httpService.get(
        `https://graph.facebook.com/${this.META_VERSION_API}/${userId}`,
        {
          params: {
            fields: 'name,email',
            access_token: pageAccessToken,
          },
        },
      ),
    );

    this.logger.debug('GET FACEBOOKER USER REQUEST', response.data);
    return response.data;
  }

  private async getStoredPageAccessToken(pageId: string): Promise<string> {
    const pageConnection = await this.prisma.metaPageConnection.findFirst({
      where: {
        pageId: pageId,
      },
    });
    return pageConnection.accessToken;
  }

  async handleOutgoingMessage(
    ticketId: string,
    message: string,
  ): Promise<void> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { customer: true },
    });

    try {
      if (!ticket) {
        this.logger.error(`Ticket not found: ${ticketId}`);
        return;
      }

      // Check if this is a Meta platform customer
      const customerMetadata = ticket.customer.metadata as any;
      if (!customerMetadata || !customerMetadata.facebook_id) {
        this.logger.debug('Not a Facebook customer, skipping outgoing message');
        return;
      }

      // Find the page connection for this organization
      const pageConnection = await this.prisma.metaPageConnection.findFirst({
        where: {
          organizationId: ticket.customer.organizationId,
          platform: MetaPlatform.FACEBOOK,
        },
      });

      if (!pageConnection) {
        this.logger.error(
          'No Facebook page connection found for this organization',
        );
        return;
      }

      // Send message to Facebook
      await this.sendFacebookMessage(
        pageConnection.pageId,
        customerMetadata.facebook_id,
        message,
      );

      this.logger.debug(`Message sent to Facebook: ${message}`);
    } catch (error) {
      this.logger.error('Error sending message to Facebook', error);
    }
  }
}
