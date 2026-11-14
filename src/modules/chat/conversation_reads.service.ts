import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConversationRead } from "@/modules/chat/entities/conversation_reads.entity";
import {
  CreateConversationReadDto,
  UpdateConversationReadDto,
} from "@/modules/chat/dto/conversation_reads.dto";

@Injectable()
export class ConversationReadService {
  constructor(
    @InjectRepository(ConversationRead)
    private readonly conversationReadRepository: Repository<ConversationRead>,
  ) {}

  async getConversationReads() {
    try {
      const conversationsRead = await this.conversationReadRepository.find();
      return conversationsRead;
    } catch (error) {
      throw error;
    }
  }

  async getConversationReadById(conversation_id: string) {
    try {
      const conversationRead = await this.conversationReadRepository.findOne({
        where: { conversation_id },
      });
      if (!conversationRead) {
        throw new NotFoundException("Conversation read with ID not found");
      }
      return conversationRead;
    } catch (error) {
      throw error;
    }
  }

  async createConversationRead(dto: CreateConversationReadDto) {
    try {
      const conversationRead = this.conversationReadRepository.create(dto);
      return await this.conversationReadRepository.save(conversationRead);
    } catch (error) {
      throw error;
    }
  }

  async updateConversationRead(
    conversation_id: string,
    dto: UpdateConversationReadDto,
  ) {
    try {
      if (!conversation_id) {
        throw new NotFoundException("Message with ID not found");
      }
      const conversationRead = await this.conversationReadRepository.findOne({
        where: { conversation_id },
      });
      if (!conversationRead) {
        throw new NotFoundException("Message with ID not found");
      }
      Object.assign(conversationRead, dto);
      const { conversation_id: uid, ...rest } = conversationRead;
      return await this.conversationReadRepository.update(
        { conversation_id: uid },
        rest,
      );
    } catch (error) {
      throw error;
    }
  }
}
