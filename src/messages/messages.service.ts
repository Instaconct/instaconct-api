import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  message: Message[] = [
    { id: 'test', username: 'omar', content: 'Hello World!' },
    { id: 'test', username: 'omar', content: 'Hello World!' },
  ];

  clientToUser = {};

  identify(clientId: string, name: string) {
    this.clientToUser[clientId] = name;
    return Object.values(this.clientToUser);
  }

  getUserName(clientId: string) {
    return this.clientToUser[clientId];
  }

  create(createMessageDto: CreateMessageDto) {
    this.message.push({
      ...createMessageDto,
      id: Math.random().toString(),
    });
    return createMessageDto;
  }

  findAll() {
    return this.message;
  }

  findOne(id: number) {
    return { message: `This action returns a #${id} message` };
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
