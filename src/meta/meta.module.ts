import { Module } from '@nestjs/common';
import { MetaService } from './meta.service';
import { MetaController } from './meta.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({ 
  imports:[HttpModule,AuthModule],
  controllers: [MetaController],
  providers: [MetaService,ConfigService,PrismaService],
})  
export class MetaModule {} 
 