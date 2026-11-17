import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "@/modules/chat/entities/messages.entity";
import { MessageService } from "@/modules/chat/message.service";
import { MessageController } from "@/modules/chat/message.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
