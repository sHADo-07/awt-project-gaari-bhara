import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConversationRead } from "@/modules/chat/entities/conversation_reads.entity";
import { Conversation } from "@/modules/chat/entities/conversation.entity";
import {
  CreateConversationReadDto,
  UpdateConversationReadDto,
} from "@/modules/chat/dto/conversation_reads.dto";

@Injectable()
export class ConversationReadService {
  constructor(
    @InjectRepository(ConversationRead)
    private readonly conversationReadRepository: Repository<ConversationRead>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}

  async getConversationReads(userId: string) {
    const conversations = await this.getUserConversations(userId);
    if (!conversations.length) return [];

    return this.conversationReadRepository.find({
      where: conversations.map(({ id }) => ({ conversation_id: id })),
    });
  }

  async getConversationReadById(userId: string, conversation_id: string) {
    await this.findAccessibleConversation(userId, conversation_id);
    const conversationRead = await this.conversationReadRepository.findOne({
      where: { conversation_id, user_id: userId },
    });
    if (!conversationRead) {
      throw new NotFoundException("Conversation read with ID not found");
    }
    return conversationRead;
  }

  async createConversationRead(userId: string, dto: CreateConversationReadDto) {
    await this.findAccessibleConversation(userId, dto.conversation_id);
    const conversationRead = this.conversationReadRepository.create({
      ...dto,
      user_id: userId,
    });
    return this.conversationReadRepository.save(conversationRead);
  }

  async updateConversationRead(
    userId: string,
    conversation_id: string,
    dto: UpdateConversationReadDto,
  ) {
    const conversationRead = await this.getConversationReadById(
      userId,
      conversation_id,
    );
    Object.assign(conversationRead, dto);
    return this.conversationReadRepository.save(conversationRead);
  }

  async deleteConversationRead(userId: string, conversation_id: string) {
    const conversationRead = await this.getConversationReadById(
      userId,
      conversation_id,
    );
    return this.conversationReadRepository.delete({
      conversation_id: conversationRead.conversation_id,
    });
  }

  private getUserConversations(userId: string) {
    return this.conversationRepository.find({
      where: [{ user_low_id: userId }, { user_high_id: userId }],
    });
  }

  private async findAccessibleConversation(userId: string, id: string) {
    const conversation = await this.conversationRepository.findOne({
      where: [
        { id, user_low_id: userId },
        { id, user_high_id: userId },
      ],
    });
    if (!conversation) {
      throw new ForbiddenException(
        "You are not a participant in this conversation",
      );
    }
    return conversation;
  }
}
