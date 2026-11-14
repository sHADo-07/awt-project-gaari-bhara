import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "conversation_reads" })
export class ConversationRead {
  @PrimaryGeneratedColumn("uuid")
  conversation_id!: string;

  @Column()
  user_id!: string;

  @Column()
  last_read_message_id!: string;

  @Column({ type: "timestamptz" })
  updated_at!: Date;
}
