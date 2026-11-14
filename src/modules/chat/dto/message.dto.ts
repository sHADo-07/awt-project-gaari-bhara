import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Column } from "typeorm";
import { randomUUID } from "node:crypto";

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty({ message: "No conversation ID provided" })
  conversation_id!: string;

  @IsString()
  @IsNotEmpty({ message: "No sender ID provided" })
  sender_id!: string;

  @IsString()
  @IsNotEmpty({ message: "Message body cannot be empty" })
  body!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "Client message ID cannot be empty" })
  @Column({ type: "timestamptz" })
  client_msg_id?: string = randomUUID();

  @IsOptional()
  @Column({ type: "timestamptz" })
  created_at?: Date = new Date();
}

export class UpdateMessageDto {
  @IsString({message: "Message body must be a string"})
  @IsNotEmpty({ message: "Message body cannot be empty" })
  body!: string;
}
