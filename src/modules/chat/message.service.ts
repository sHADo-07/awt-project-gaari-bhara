import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Message } from "@/modules/chat/entities/messages.entity";
import {
  CreateMessageDto,
  UpdateMessageDto,
} from "@/modules/chat/dto/message.dto";

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async getMessages() {
    try {
      const conversations = await this.messageRepository.find();
      return conversations;
    } catch (error) {
      throw error;
    }
  }

  async getMessageById(id: string) {
    try {
      const message = await this.messageRepository.findOne({
        where: { id },
      });
      if (!message) {
        throw new NotFoundException("Message with ID not found");
      }
      return message;
    } catch (error) {
      throw error;
    }
  }

  async createMessage(dto: CreateMessageDto) {
    try {
      const message = this.messageRepository.create(dto);
      return await this.messageRepository.save(message);
    } catch (error) {
      throw error;
    }
  }

  async updateMessage(id: string, dto: UpdateMessageDto) {
    try {
      if (!id) {
        throw new NotFoundException("Message with ID not found");
      }
      const message = await this.messageRepository.findOne({
        where: { id },
      });
      if (!message) {
        throw new NotFoundException("Message with ID not found");
      }
      Object.assign(message, dto);
      const { id: uid, ...rest } = message;
      return await this.messageRepository.update({ id: id }, rest);
    } catch (error) {
      throw error;
    }
  }

  async deleteMessage(id: string) {
    try {
      const message = await this.messageRepository.findOne({
        where: { id },
      });
      if (!message) {
        throw new NotFoundException("Message with ID not found");
      }
      return await this.messageRepository.delete({ id });
    } catch (error) {
      throw error;
    }
  }
}
