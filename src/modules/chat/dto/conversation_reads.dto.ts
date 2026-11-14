import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Column } from "typeorm";

export class CreateConversationReadDto {
  @IsString()
  @IsNotEmpty({ message: "No conversation ID provided" })
  conversation_id!: string;

  @IsString()
  @IsNotEmpty({ message: "No user ID provided" })
  user_id!: string;

  @IsString()
  @IsNotEmpty({ message: "no message id provided" })
  last_read_message_id!: string;

  @IsOptional()
  @IsDate()
  @Column({ type: "timestamptz" })
  updated_at?: Date = new Date();
}

export class UpdateConversationReadDto {
  @IsString()
  @IsNotEmpty({ message: "message ID cannot be empty" })
  last_read_message_id!: string;
}
