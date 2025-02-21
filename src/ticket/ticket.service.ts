import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketStatus } from '@prisma/client';
import { Jwt } from 'src/auth/provider/jwt.provider';

@Injectable()
export class TicketService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtProvider: Jwt,
  ) {}

  async create(createTicketDto: CreateTicketDto, organizationId: string) {
    try {
      const ticket = await this.prismaService.ticket.create({
        data: {
          organization: { connect: { id: organizationId } },
          customer: {
            connectOrCreate: {
              where: {
                email_organizationId: {
                  email: createTicketDto.customer.email,
                  organizationId: organizationId,
                },
              },
              create: {
                email: createTicketDto.customer.email,
                name: createTicketDto.customer.name,
                phone: createTicketDto.customer.phone,
                organization: { connect: { id: organizationId } },
              },
            },
          },
        },
        include: {
          customer: true,
        },
      });

      return { ticketId: ticket.id, customer: ticket.customer };
    } catch (error) {
      console.log(error);
      if (error.meta.target === 'User_phone_key') {
        throw new ConflictException('Phone number already exists');
      }

      if (error.meta.target === 'User_email_key') {
        throw new ConflictException('Email already exists');
      }
    }
  }

  async findAll(organizationId: string) {
    return this.prismaService.ticket.findMany({
      where: { status: TicketStatus.OPEN, organizationId },
      include: {
        organization: true,
        customer: true,
      },
    });
  }

  /**
   * Finds a single ticket by its ID
   * @param id - The unique identifier of the ticket to find
   * @param organizationId - The unique identifier of the organization that the ticket belongs to
   * @returns A Promise that resolves to the ticket with its related organization, customer and messages
   * If no ticket is found with the given ID, returns null
   */
  async findOne(id: string, organizationId: string) {
    return this.prismaService.ticket.findUnique({
      where: { id, organizationId },
      include: {
        organization: true,
        customer: true,
      },
    });
  }

  async closeTicket(ticketId: string) {
    return await this.prismaService.ticket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.CLOSED,
      },
    });
  }

  async findMessages(ticketId: string, organizationId: string) {
    //TODO: add pagination
    return await this.prismaService.message.findMany({
      where: { ticketId, ticket: { organizationId } },
      include: {
        sender: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
