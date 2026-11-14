import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Column } from "typeorm";

export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  user_low_id!: string;

  @IsString()
  @IsNotEmpty()
  user_high_id!: string;

  @IsString()
  @IsNotEmpty()
  post_id!: string;

  @IsOptional()
  @Column({ type: "timestamptz" })
  last_message_at?: Date = new Date();

  @IsOptional()
  @Column({ type: "timestamptz" })
  created_at?: Date = new Date();
}

export class UpdateLastMessageTimestampDto {
  @Column({ type: "timestamptz" })
  last_message_at: Date = new Date();
}
