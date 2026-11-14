import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ConversationService } from "@/modules/chat/conversation.service";
import {
  CreateConversationDto,
  UpdateLastMessageTimestampDto,
} from "@/modules/chat/dto/conversation.dto";

@Controller("conversations")
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  async createConversation(@Body() conversationDto: CreateConversationDto) {
    return await this.conversationService.createConversation(conversationDto);
  }

  @Get()
  async getConversations() {
    return await this.conversationService.getConversations();
  }

  @Get(":id")
  async getConversationById(@Param("id") id: string) {
    return await this.conversationService.getConversationById(id);
  }

  @Patch(":id")
  async updateConversation(
    @Param("id") id: string,
    @Body() conversationDto: UpdateLastMessageTimestampDto,
  ) {
    return await this.conversationService.updateConversation(id, conversationDto);
  }

  @Delete(":id")
  async deleteConversation(@Param("id") id: string) {
    return await this.conversationService.deleteConversation(id);
  }
}
