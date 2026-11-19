import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "@/modules/chat/entities/messages.entity";
import { MessageService } from "@/modules/chat/message.service";
import { MessageController } from "@/modules/chat/message.controller";
import { Conversation } from "@/modules/chat/entities/conversation.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Message, Conversation])],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
