import {
  Body,
  Controller,
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

@Controller("conversation_reads")
export class ConversationReadsController {
  constructor(private readonly conversationReadService: ConversationReadService) {}

  @Post()
  async createConversationReads(@Body() dto: CreateConversationReadDto) {
    return await this.conversationReadService.createConversationRead(dto);
  }

  @Get()
  async getConversationReads() {
    return await this.conversationReadService.getConversationReads();
  }

  @Get(":id")
  async getConversationReadsById(@Param("id") id: string) {
    return await this.conversationReadService.getConversationReadById(id);
  }

  @Patch(":id")
  async updateConversationReads(
    @Param("id") id: string,
    @Body() ConversationReadsDto: UpdateConversationReadDto,
  ) {
    return await this.conversationReadService.updateConversationRead(id, ConversationReadsDto);
  }
}
