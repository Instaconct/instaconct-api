import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class MessagesService {
  constructor(private readonly PrismaService: PrismaService) {}

  async create(createMessageDto: CreateMessageDto) {
    const message = await this.PrismaService.message.create({
      data: createMessageDto,
    });

    return message;
  }

  async findAll(tickedId: string) {
    return await this.PrismaService.message.findMany({
      where: { ticketId: tickedId },
    });
  }

  update(id: string, updateMessageDto: UpdateMessageDto) {
    return this.PrismaService.message.update({
      where: { id },
      data: updateMessageDto,
    });
  }

  remove(id: string) {
    return this.PrismaService.message.delete({
      where: { id },
    });
  }
}
