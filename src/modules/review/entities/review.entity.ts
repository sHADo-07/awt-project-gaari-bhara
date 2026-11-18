import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "reviews" })
export class Review {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  rent_id!: string;

  @Column({ type: "uuid" })
  author_id!: string;

  @Column({ type: "uuid" })
  subject_id!: string;

  @Column({ type: "smallint" })
  rating!: number;

  @Column({ type: "text" })
  comment!: string;

  @Column({ type: "boolean", default: false })
  is_hidden!: boolean;

  @Column({ type: "timestamptz" })
  created_at!: Date;
}
