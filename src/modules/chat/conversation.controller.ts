import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { ConversationService } from "@/modules/chat/conversation.service";
import {
  CreateConversationDto,
  UpdateLastMessageTimestampDto,
} from "@/modules/chat/dto/conversation.dto";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@/common/guard";
import { CurrentUser } from "@/common/decorators";
import { AuthUser } from "@/common/interfaces/auth-user.interface";

@ApiTags("conversation")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("conversations")
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @ApiOperation({ summary: "Create a new conversation" })
  async createConversation(
    @CurrentUser() user: AuthUser,
    @Body() conversationDto: CreateConversationDto,
  ) {
    return await this.conversationService.createConversation(
      user.id,
      conversationDto,
    );
  }

  @Get()
  @ApiOperation({ summary: "Get all conversations" })
  async getConversations(@CurrentUser() user: AuthUser) {
    return await this.conversationService.getConversations(user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a conversation by ID" })
  async getConversationById(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
  ) {
    return await this.conversationService.getConversationById(user.id, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a conversation" })
  async updateConversation(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() conversationDto: UpdateLastMessageTimestampDto,
  ) {
    return await this.conversationService.updateConversation(
      user.id,
      id,
      conversationDto,
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a conversation" })
  async deleteConversation(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
  ) {
    return await this.conversationService.deleteConversation(user.id, id);
  }
}
