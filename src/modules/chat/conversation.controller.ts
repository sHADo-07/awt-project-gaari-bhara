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
  constructor(private readonly productService: ConversationService) {}

  @Post()
  async createConversation(@Body() conversationDto: CreateConversationDto) {
    return await this.productService.createConversation(conversationDto);
  }

  @Get()
  async getConversations() {
    return await this.productService.getConversations();
  }

  @Get(":id")
  async getConversationById(@Param("id") id: string) {
    return await this.productService.getConversationById(id);
  }

  @Patch(":id")
  async updateConversation(
    @Param("id") id: string,
    @Body() conversationDto: UpdateLastMessageTimestampDto,
  ) {
    return await this.productService.updateConversation(id, conversationDto);
  }

  @Delete(":id")
  async deleteConversation(@Param("id") id: string) {
    return await this.productService.deleteConversation(id);
  }
}
