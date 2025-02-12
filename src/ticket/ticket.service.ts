import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Role, TicketStatus } from '@prisma/client';
import { Jwt } from 'src/auth/provider/jwt.provider';

@Injectable()
export class TicketService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtProvider: Jwt,
  ) {}

  async create(createTicketDto: CreateTicketDto) {
    const ticket = await this.prismaService.ticket.create({
      data: {
        organization: { connect: { id: createTicketDto.organizationId } },
        customer: {
          create: {
            email: createTicketDto.customer.email,
            name: createTicketDto.customer.name,
            organization: { connect: { id: createTicketDto.organizationId } },
            role: Role.CUSTOMER,
          },
        },
      },
    });

    const token = await this.jwtProvider.generateTicketToken(ticket.id);
    return { ticketId: ticket.id, token };
  }

  async findAll() {
    return this.prismaService.ticket.findMany({
      where: { status: TicketStatus.OPEN },
      include: {
        organization: true,
        customer: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prismaService.ticket.findUnique({
      where: { id },
      include: {
        organization: true,
        customer: true,
      },
    });
  }
}
