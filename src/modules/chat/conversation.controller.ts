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
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("conversation")
@Controller("conversations")
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @ApiOperation({ summary: "Create a new conversation" })
  async createConversation(@Body() conversationDto: CreateConversationDto) {
    return await this.conversationService.createConversation(conversationDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all conversations" })
  async getConversations() {
    return await this.conversationService.getConversations();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a conversation by ID" })
  async getConversationById(@Param("id") id: string) {
    return await this.conversationService.getConversationById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a conversation" })
  async updateConversation(
    @Param("id") id: string,
    @Body() conversationDto: UpdateLastMessageTimestampDto,
  ) {
    return await this.conversationService.updateConversation(id, conversationDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a conversation" })
  async deleteConversation(@Param("id") id: string) {
    return await this.conversationService.deleteConversation(id);
  }
}
