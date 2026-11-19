import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
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

  getConversations(userId: string) {
    return this.conversationRepository.find({
      where: [{ user_low_id: userId }, { user_high_id: userId }],
    });
  }

  async getConversationById(userId: string, id: string) {
    return this.findAccessibleConversation(userId, id);
  }

  async createConversation(userId: string, dto: CreateConversationDto) {
    if (dto.user_low_id !== userId && dto.user_high_id !== userId) {
      throw new ForbiddenException(
        "You are not a participant in this conversation",
      );
    }

    const conversation = this.conversationRepository.create(dto);
    return this.conversationRepository.save(conversation);
  }

  async updateConversation(
    userId: string,
    id: string,
    dto: UpdateLastMessageTimestampDto,
  ) {
    const conversation = await this.findAccessibleConversation(userId, id);
    Object.assign(conversation, dto);
    return this.conversationRepository.save(conversation);
  }

  async deleteConversation(userId: string, id: string) {
    const conversation = await this.findAccessibleConversation(userId, id);
    return this.conversationRepository.delete({ id: conversation.id });
  }

  private async findAccessibleConversation(userId: string, id: string) {
    const conversation = await this.conversationRepository.findOne({
      where: {
        id,
        user_low_id: In([userId]),
      },
    });
    if (conversation) return conversation;

    const otherConversation = await this.conversationRepository.findOne({
      where: {
        id,
        user_high_id: In([userId]),
      },
    });
    if (!otherConversation) {
      throw new NotFoundException("Conversation with ID not found");
    }
    return otherConversation;
  }
}
