import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { OrganizationModule } from 'src/organization/organization.module';
import { TicketModule } from 'src/ticket/ticket.module';

@Module({
  imports: [OrganizationModule, TicketModule],
  providers: [MessagesGateway, MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
