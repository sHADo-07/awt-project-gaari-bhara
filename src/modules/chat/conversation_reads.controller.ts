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

@Controller("ConversationReads_reads")
export class ConversationReadsController {
  constructor(private readonly productService: ConversationReadService) {}

  @Post()
  async createConversationReads(@Body() dto: CreateConversationReadDto) {
    return await this.productService.createConversationRead(dto);
  }

  @Get()
  async getConversationReads() {
    return await this.productService.getConversationReads();
  }

  @Get(":id")
  async getConversationReadsById(@Param("id") id: string) {
    return await this.productService.getConversationReadById(id);
  }

  @Patch(":id")
  async updateConversationReads(
    @Param("id") id: string,
    @Body() ConversationReadsDto: UpdateConversationReadDto,
  ) {
    return await this.productService.updateConversationRead(id, ConversationReadsDto);
  }
}
