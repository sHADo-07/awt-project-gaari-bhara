import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Conversation } from "@/modules/chat/entities/conversation.entity";
import { ConversationService } from "@/modules/chat/conversation.service";
import { ConversationController } from "@/modules/chat/conversation.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Conversation])],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
