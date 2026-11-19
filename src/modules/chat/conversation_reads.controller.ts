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
import { ConversationReadService } from "@/modules/chat/conversation_reads.service";
import {
  CreateConversationReadDto,
  UpdateConversationReadDto,
} from "@/modules/chat/dto/conversation_reads.dto";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@/common/guard";
import { CurrentUser } from "@/common/decorators";
import { AuthUser } from "@/common/interfaces/auth-user.interface";

@ApiTags("conversation_reads")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("conversation_reads")
export class ConversationReadsController {
  constructor(
    private readonly conversationReadService: ConversationReadService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Add entry for a new conversation read" })
  async createConversationReads(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateConversationReadDto,
  ) {
    return await this.conversationReadService.createConversationRead(
      user.id,
      dto,
    );
  }

  @Get()
  @ApiOperation({ summary: "Get all conversation read entries" })
  async getConversationReads(@CurrentUser() user: AuthUser) {
    return await this.conversationReadService.getConversationReads(user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a conversation read entry by ID" })
  async getConversationReadsById(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
  ) {
    return await this.conversationReadService.getConversationReadById(
      user.id,
      id,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a conversation read entry" })
  async updateConversationReads(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() ConversationReadsDto: UpdateConversationReadDto,
  ) {
    return await this.conversationReadService.updateConversationRead(
      user.id,
      id,
      ConversationReadsDto,
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a conversation read entry" })
  async deleteConversationReads(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
  ) {
    return await this.conversationReadService.deleteConversationRead(
      user.id,
      id,
    );
  }
}
