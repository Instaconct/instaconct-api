import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MetaMessengerService } from './meta-messenger.service';

@Controller('meta/webhook')
export class MetaWebhookController {
  constructor(
    private configService: ConfigService,
    private metaMessengerService: MetaMessengerService,
  ) {}

  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ): string {
    const verifyToken = this.configService.get<string>(
      'META_WEBHOOK_VERIFY_TOKEN',
    );

    if (mode === 'subscribe' && token === verifyToken) {
      return challenge.replace(/\D/g, '');
    }

    throw new Error('Webhook verification failed');
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: any): Promise<string> {
    if (payload.object === 'page') {
      for (const entry of payload.entry) {
        for (const messaging of entry.messaging || []) {
          await this.metaMessengerService.handleFacebookMessage(messaging);
        }
      }
    } else if (payload.object === 'instagram') {
      for (const entry of payload.entry) {
        for (const messaging of entry.messaging || []) {
          await this.metaMessengerService.handleInstagramMessage(messaging);
        }
      }
    }

    return 'EVENT_RECEIVED';
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  async sendTestSendMessage(@Body() body: any) {
    return this.metaMessengerService.sendFacebookMessage(
      body.pageId,
      body.recipientId,
      body.message,
    );
  }
}
