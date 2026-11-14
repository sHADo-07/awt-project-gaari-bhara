import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Column } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

export class CreateConversationReadDto {
  @IsString()
  @ApiProperty({
    description: "UUID of the conversation",
    example: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  })
  @IsNotEmpty({ message: "No conversation ID provided" })
  conversation_id!: string;

  @ApiProperty({
    description: "UUID of the user",
    example: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  })
  @IsString()
  @IsNotEmpty({ message: "No user ID provided" })
  user_id!: string;

  @ApiProperty({
    description: "UUID of the last read message",
    example: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  })
  @IsString()
  @IsNotEmpty({ message: "no message id provided" })
  last_read_message_id!: string;

  @IsOptional()
  @IsDate()
  @ApiProperty({
    description: "Timestamp of the last read message",
    example: "2023-01-01T00:00:00.000Z",
  })
  @Column({ type: "timestamptz" })
  updated_at?: Date = new Date();
}

export class UpdateConversationReadDto {
  @IsString()
  @IsNotEmpty({ message: "message ID cannot be empty" })
  @ApiProperty({
    description: "UUID of the last read message",
    example: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  })
  last_read_message_id!: string;
}
