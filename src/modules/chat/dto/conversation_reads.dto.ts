import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Column } from "typeorm";

export class CreateConversationReadDto {
  @IsString()
  @IsNotEmpty({ message: "No user ID provided" })
  user_id!: string;

  @IsString()
  @IsNotEmpty({ message: "" })
  last_read_message_id!: string;

  @IsOptional()
  @IsString()
  @Column({ type: "timestamptz" })
  updated_at?: Date = new Date();
}

export class UpdateConversationReadDto {
  @IsString({message: ""})
  @IsNotEmpty({ message: "" })
  last_read_message_id!: string;
}
