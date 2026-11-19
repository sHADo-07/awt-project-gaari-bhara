import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Conversation } from "@/modules/chat/entities/conversation.entity";
import { ConversationService } from "@/modules/chat/conversation.service";
import { ConversationController } from "@/modules/chat/conversation.controller";
import { Message } from "@/modules/chat/entities/messages.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message])],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
