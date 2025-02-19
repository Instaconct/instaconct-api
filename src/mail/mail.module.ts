import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { BullModule } from '@nestjs/bullmq';
import { MailConsumer } from './mail.processor';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailCronService } from './mail.cron';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mail',
    }),
    PrismaModule,
  ],
  providers: [MailService, MailConsumer, MailCronService],
  exports: [MailService],
})
export class MailModule {}
