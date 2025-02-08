import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { Jwt } from './provider/jwt.provider';
import { Hash } from './provider/hash.provider';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from 'src/mail/mail.module';
import { AuthenticationGuard } from './guard/authentication.guard';

@Module({
  imports: [JwtModule.register({}), PrismaModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService, Jwt, Hash, AuthenticationGuard],
  exports: [Jwt, Hash, AuthenticationGuard],
})
export class AuthModule {}
