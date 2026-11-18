import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { RentStatus } from "@/modules/rent/rent.constants";

@Entity({ name: "rent_status_history" })
export class RentStatusHistory {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ type: "uuid" })
  rent_id!: string;

  @Column({
    type: "enum",
    enum: RentStatus,
    enumName: "rent_status",
    nullable: true,
  })
  old_status!: RentStatus | null;

  @Column({
    type: "enum",
    enum: RentStatus,
    enumName: "rent_status",
  })
  new_status!: RentStatus;

  @Column({ type: "uuid", nullable: true })
  changed_by!: string | null;

  @Column({ type: "text", nullable: true })
  note!: string | null;

  @Column({ type: "timestamptz" })
  created_at!: Date;
}
