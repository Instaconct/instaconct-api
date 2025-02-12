import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
@Injectable()
export class MessagesService {
  clientToUser = {};

  identify(clientId: string, name: string) {
    this.clientToUser[clientId] = name;
    return Object.values(this.clientToUser);
  }

  getUserName(clientId: string) {
    return this.clientToUser[clientId];
  }

  create(createMessageDto: CreateMessageDto) {
    return createMessageDto;
  }

  findAll() {
    return [];
  }

  findOne(id: number) {
    return { message: `This action returns a #${id} message` };
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return updateMessageDto;
  }

  remove(id: number) {
    return { message: `This action removes a #${id} message` };
  }
}
