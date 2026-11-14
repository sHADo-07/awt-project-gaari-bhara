import {
  Body,
  Controller, Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ConversationReadService } from "@/modules/chat/conversation_reads.service";
import {
  CreateConversationReadDto,
  UpdateConversationReadDto,
} from "@/modules/chat/dto/conversation_reads.dto";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("conversation_reads")
@Controller("conversation_reads")
export class ConversationReadsController {
  constructor(private readonly conversationReadService: ConversationReadService) {}

  @Post()
  @ApiOperation({ summary: "Add entry for a new conversation read" })
  async createConversationReads(@Body() dto: CreateConversationReadDto) {
    return await this.conversationReadService.createConversationRead(dto);
  }

  @Get()
  @ApiOperation({ summary: "Get all conversation read entries" })
  async getConversationReads() {
    return await this.conversationReadService.getConversationReads();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a conversation read entry by ID" })
  async getConversationReadsById(@Param("id") id: string) {
    return await this.conversationReadService.getConversationReadById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a conversation read entry" })
  async updateConversationReads(
    @Param("id") id: string,
    @Body() ConversationReadsDto: UpdateConversationReadDto,
  ) {
    return await this.conversationReadService.updateConversationRead(id, ConversationReadsDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a conversation read entry" })
  async deleteConversationReads(@Param("id") id: string) {
    return await this.conversationReadService.deleteConversationRead(id);
  }
}
