import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { SdkGuard } from 'src/auth/guard/sdk.guard';
import { Request } from 'express';
import { AuthenticationGuard } from 'src/auth/guard/authentication.guard';
import { GetUser } from 'src/shared/decorator/user.decorator';
import { User } from '@prisma/client';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @UseGuards(SdkGuard)
  create(@Body() createTicketDto: CreateTicketDto, @Req() req: Request) {
    return this.ticketService.create(createTicketDto, req['organization'].id);
  }

  @Get()
  @UseGuards(AuthenticationGuard)
  findAll(@GetUser() userInfo: User) {
    return this.ticketService.findAll(userInfo.organizationId);
  }

  @Get('/:ticketId')
  @UseGuards(AuthenticationGuard)
  findOne(@Param('ticketId') ticketId: string, @GetUser() userInfo: User) {
    return this.ticketService.findOne(ticketId, userInfo.organizationId);
  }

  @Get('/:ticketId/messages')
  @UseGuards(AuthenticationGuard)
  findMessages(@Param('ticketId') ticketId: string, @GetUser() userInfo: User) {
    return this.ticketService.findMessages(ticketId, userInfo.organizationId);
  }
}
