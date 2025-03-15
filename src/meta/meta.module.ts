import { Module } from '@nestjs/common';
import { MetaService } from './meta.service';
import { MetaController } from './meta.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { MetaWebhookController } from './meta-webhook.controller';
import { MessagesModule } from 'src/messages/messages.module';
import { MetaMessengerService } from './meta-messenger.service';

@Module({
  imports: [HttpModule, AuthModule, MetaModule, MessagesModule],
  controllers: [MetaController, MetaWebhookController],
  providers: [MetaService, ConfigService, PrismaService, MetaMessengerService],
  exports: [MetaMessengerService],
})
export class MetaModule {}
