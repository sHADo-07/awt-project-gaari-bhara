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
import { MessageService } from "@/modules/chat/message.service";
import {
  CreateMessageDto,
  UpdateMessageDto,
} from "@/modules/chat/dto/message.dto";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@/common/guard";
import { CurrentUser } from "@/common/decorators";
import { AuthUser } from "@/common/interfaces/auth-user.interface";

@ApiTags("message")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("messages")
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiOperation({ summary: "Create a new message" })
  async createMessage(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateMessageDto,
  ) {
    return await this.messageService.createMessage(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: "Get all messages" })
  async getMessages(@CurrentUser() user: AuthUser) {
    return await this.messageService.getMessages(user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a message by ID" })
  async getMessageById(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return await this.messageService.getMessageById(user.id, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a message" })
  async updateMessage(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return await this.messageService.updateMessage(user.id, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a message" })
  async deleteMessage(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return await this.messageService.deleteMessage(user.id, id);
  }
}
