import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MessagesModule } from './messages/messages.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { OrganizationModule } from './organization/organization.module';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'node:path';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
    }),
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        stores: [
          createKeyv(
            `redis://${configService.getOrThrow('REDIS_HOST')}:${configService.getOrThrow('REDIS_PORT')}`,
          ),
        ],
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
    MailerModule.forRoot({
      transport: {
        service: process.env.MAIL_HOST,
        auth: {
          user: process.env.USER_EMAIL,
          pass: process.env.EMAIL_PASS,
        },
      },
      defaults: {
        from: 'omarsabra509@gmail.com',
      },
      template: {
        dir: join(__dirname, 'mail', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    MailModule,
    MessagesModule,
    AuthModule,
    PrismaModule,
    UserModule,
    OrganizationModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
