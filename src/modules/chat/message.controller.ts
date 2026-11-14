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

@Controller("messages")
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async createMessage(@Body() dto: CreateMessageDto) {
    return await this.messageService.createMessage(dto);
  }

  @Get()
  async getMessages() {
    return await this.messageService.getMessages();
  }

  @Get(":id")
  async getMessageById(@Param("id") id: string) {
    return await this.messageService.getMessageById(id);
  }

  @Patch(":id")
  async updateMessage(
    @Param("id") id: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return await this.messageService.updateMessage(id, dto);
  }

  @Delete(":id")
  async deleteMessage(@Param("id") id: string) {
    return await this.messageService.deleteMessage(id);
  }
}
