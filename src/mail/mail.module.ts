import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { BullModule } from '@nestjs/bullmq';
import { MailConsumer } from './mail.processor';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mail',
    }),
    PrismaModule,
  ],
  providers: [MailService, MailConsumer],
  exports: [MailService],
})
export class MailModule {}
