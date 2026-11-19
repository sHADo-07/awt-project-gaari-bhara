import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Message } from "@/modules/chat/entities/messages.entity";
import { Conversation } from "@/modules/chat/entities/conversation.entity";
import {
  CreateMessageDto,
  UpdateMessageDto,
} from "@/modules/chat/dto/message.dto";

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}

  async getMessages(userId: string) {
    const conversations = await this.getUserConversations(userId);
    if (!conversations.length) return [];

    return this.messageRepository.find({
      where: { conversation_id: In(conversations.map(({ id }) => id)) },
    });
  }

  async getMessageById(userId: string, id: string) {
    const message = await this.findAccessibleMessage(userId, id);
    return message;
  }

  async createMessage(userId: string, dto: CreateMessageDto) {
    await this.findAccessibleConversation(userId, dto.conversation_id);
    const message = this.messageRepository.create({
      ...dto,
      sender_id: userId,
    });
    return this.messageRepository.save(message);
  }

  async updateMessage(userId: string, id: string, dto: UpdateMessageDto) {
    const message = await this.findAccessibleMessage(userId, id);
    Object.assign(message, dto);
    return this.messageRepository.save(message);
  }

  async deleteMessage(userId: string, id: string) {
    const message = await this.findAccessibleMessage(userId, id);
    return this.messageRepository.delete({ id: message.id });
  }

  private async findAccessibleMessage(userId: string, id: string) {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) throw new NotFoundException("Message with ID not found");

    await this.findAccessibleConversation(userId, message.conversation_id);
    return message;
  }

  private async getUserConversations(userId: string) {
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
