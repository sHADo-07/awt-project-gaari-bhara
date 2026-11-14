import { IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";
import { Column } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

export class CreateConversationDto {
  @ApiProperty({
    description: "ID of the user with the lower UUID",
    example: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    { message: "Invalid user_low_id format" },
  )
  user_low_id!: string;

  @ApiProperty({
    description: "ID of the user with the higher UUID",
    example: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    { message: "Invalid user_high_id format" },
  )
  user_high_id!: string;

  @ApiProperty({
    description: "ID of the post",
    example: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    { message: "Invalid post_id format" },
  )
  post_id!: string;

  @IsOptional()
  @ApiProperty({
    description: "Timestamp of the last message in the conversation",
    example: "2023-01-01T00:00:00.000Z",
  })
  @Column({ type: "timestamptz" })
  last_message_at?: Date = new Date();

  @ApiProperty({
    description: "Timestamp of when the conversation was created",
    example: "2023-01-01T00:00:00.000Z",
  })
  @IsOptional()
  @Column({ type: "timestamptz" })
  created_at?: Date = new Date();
}

export class UpdateLastMessageTimestampDto {
  @Column({ type: "timestamptz" })
  @ApiProperty({
    description: "Timestamp of the last message in the conversation",
    example: "2023-01-01T00:00:00.000Z",
  })
  last_message_at: Date = new Date();
}
