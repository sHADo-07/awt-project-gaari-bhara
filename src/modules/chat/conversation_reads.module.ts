import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConversationRead } from "@/modules/chat/entities/conversation_reads.entity";
import { ConversationReadsController } from "@/modules/chat/conversation_reads.controller";
import { ConversationReadService } from "@/modules/chat/conversation_reads.service";
import { Conversation } from "@/modules/chat/entities/conversation.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ConversationRead, Conversation])],
  controllers: [ConversationReadsController],
  providers: [ConversationReadService],
  exports: [ConversationReadService],
})
export class ConversationReadModule {}
