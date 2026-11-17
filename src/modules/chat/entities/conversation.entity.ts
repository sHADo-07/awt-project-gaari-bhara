import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "conversations" })
export class Conversation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  user_low_id!: string;

  @Column()
  user_high_id!: string;

  @Column()
  post_id!: string;

  @Column({ type: "timestamptz" })
  last_message_at!: Date;

  @Column({ type: "timestamptz" })
  created_at!: Date;
}