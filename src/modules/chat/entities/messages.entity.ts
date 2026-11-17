import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity({ name: "messages" })
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  conversation_id!: string;

  @Column()
  sender_id!: string;

  @Column()
  body!: string;

  @Column()
  client_msg_id!: string;

  @Column({ type: "timestamptz" })
  created_at!: Date;
}
