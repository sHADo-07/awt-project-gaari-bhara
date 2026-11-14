import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { MessageService } from "@/modules/chat/message.service";
import {
  CreateMessageDto,
  UpdateMessageDto,
} from "@/modules/chat/dto/message.dto";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("message")
@Controller("messages")
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiOperation({ summary: "Create a new message" })
  async createMessage(@Body() dto: CreateMessageDto) {
    return await this.messageService.createMessage(dto);
  }

  @Get()
  @ApiOperation({ summary: "Get all messages" })
  async getMessages() {
    return await this.messageService.getMessages();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a message by ID" })
  async getMessageById(@Param("id") id: string) {
    return await this.messageService.getMessageById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a message" })
  async updateMessage(
    @Param("id") id: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return await this.messageService.updateMessage(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a message" })
  async deleteMessage(@Param("id") id: string) {
    return await this.messageService.deleteMessage(id);
  }
}
