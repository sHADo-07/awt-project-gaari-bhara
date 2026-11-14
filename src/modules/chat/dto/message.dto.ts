import { IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";
import { Column } from "typeorm";
import { randomUUID } from "node:crypto";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export function trim(value: string): string {
  return value.trim();
}

export class CreateMessageDto {
  @IsString()
  @ApiProperty({
    description: "UUID of the conversation",
    example: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  })
  @Matches(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    { message: "Invalid conversation ID format" },
  )
  @IsNotEmpty({ message: "No conversation ID provided" })
  conversation_id!: string;

  @IsString()
  @ApiProperty({
    description: "UUID of the sender",
    example: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  })
  @Matches(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    { message: "Invalid sender ID format" },
  )
  @IsNotEmpty({ message: "No sender ID provided" })
  sender_id!: string;

  @IsString()
  @ApiProperty({
    description: "Content of the message",
    example: "Hi",
  })
  @IsNotEmpty({ message: "Message body cannot be empty" })
  body!: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: "Client message ID",
    example: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  })
  @Matches(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    { message: "Invalid client message ID format" },
  )
  @IsNotEmpty({ message: "Client message ID cannot be empty" })
  @Column({ type: "timestamptz" })
  client_msg_id?: string = randomUUID();

  @ApiProperty({
    description: "Timestamp of when the message was created",
    example: "2023-01-01T00:00:00.000Z",
  })
  @IsOptional()
  @Column({ type: "timestamptz" })
  created_at?: Date = new Date();
}

export class UpdateMessageDto {
  @ApiProperty({
    description: "Content of the message",
    example: "Hi",
  })
  @IsString({ message: "Message body must be a string" })
  @IsNotEmpty({ message: "Message body cannot be empty" })
  @Transform(({ value }) => trim(value))
  body!: string;
}
