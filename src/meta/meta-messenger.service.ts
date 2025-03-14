import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessagesService } from 'src/messages/messages.service';
import { MetaPlatform, SenderType, TicketStatus } from '@prisma/client';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WebhookMessageData } from './interfaces/message.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MetaMessengerService {
  private logger = new Logger(MetaMessengerService.name);
  private META_VERSION_API = 'v22.0';
  constructor(
    private prisma: PrismaService,
    private messagesService: MessagesService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.META_VERSION_API = this.configService.get('META_VERSION_API');
  }

  async handleFacebookMessage(messaging: WebhookMessageData): Promise<void> {
    this.logger.debug('FACEBOOK RECEIVED MESSAGE', messaging);
    const receverId = messaging.sender.id;
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
          equals: receverId,
        },
        organizationId: pageConnection.organizationId,
      },
    });

    if (!customer) {
      const userInfo = await this.getFacebookUserInfo(receverId, pageId);

      customer = await this.prisma.customer.create({
        data: {
          name: userInfo.name || 'Facebook User',
          email: userInfo.email,
          organizationId: pageConnection.organizationId,
          metadata: {
            facebook_id: receverId,
            platform: MetaPlatform.FACEBOOK,
          },
        },
      });
    }

    // Find or create ticket
    let ticket = await this.prisma.ticket.findFirst({
      where: {
        customerId: customer.id,
        status: TicketStatus.OPEN,
      },
    });

    if (!ticket) {
      ticket = await this.prisma.ticket.create({
        data: {
          organization: { connect: { id: pageConnection.organizationId } },
          customer: { connect: { id: customer.id } },
        },
      });
    }

    await this.messagesService.create({
      content: messageText,
      ticketId: ticket.id,
      customerId: customer.id,
      senderType: SenderType.CUSTOMER,
    });
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
}
