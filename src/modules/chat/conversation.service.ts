import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Conversation } from "@/modules/chat/entities/conversation.entity";
import {
  CreateConversationDto,
  UpdateLastMessageTimestampDto,
} from "@/modules/chat/dto/conversation.dto";

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}

  async getConversations() {
    try {
      const conversations = await this.conversationRepository.find();
      return conversations;
    } catch (error) {
      throw error;
    }
  }

  async getConversationById(id: string) {
    try {
      const product = await this.conversationRepository.findOne({
        where: { id },
      });
      if (!product) {
        throw new NotFoundException("Product with ID not found");
      }
      return product;
    } catch (error) {
      throw error;
    }
  }

  async createConversation(dto: CreateConversationDto) {
    try {
      const conversation = this.conversationRepository.create(dto);
      return await this.conversationRepository.save(conversation);
    } catch (error) {
      throw error;
    }
  }

  async updateConversation(id: string, dto: UpdateLastMessageTimestampDto) {
    try {
      if (!id) {
        throw new NotFoundException("Conversation with ID not found");
      }
      const conversation = await this.conversationRepository.findOne({
        where: { id },
      });
      if (!conversation) {
        throw new NotFoundException("Conversation with ID not found");
      }
      Object.assign(conversation, dto);
      const { id: uid, ...rest } = conversation;
      return await this.conversationRepository.update({ id: id }, rest);
    } catch (error) {
      throw error;
    }
  }

  async deleteConversation(id: string) {
    try {
      const conversation = await this.conversationRepository.findOne({
        where: { id },
      });
      if (!conversation) {
        throw new NotFoundException("Conversation with ID not found");
      }
      return await this.conversationRepository.delete({ id });
    } catch (error) {
      throw error;
    }
  }
}
