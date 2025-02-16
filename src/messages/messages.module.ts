import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { OrganizationModule } from 'src/organization/organization.module';
import { TicketModule } from 'src/ticket/ticket.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    OrganizationModule,
    TicketModule,
    AuthModule,
    PrismaModule,
    UserModule,
  ],
  providers: [MessagesGateway, MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
