import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { RentStatus } from "@/modules/rent/rent.constants";

@Entity({ name: "rents" })
export class Rent {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  post_id!: string;

  @Column({ type: "uuid" })
  owner_id!: string;

  @Column({ type: "uuid" })
  renter_id!: string;

  @Column({ type: "uuid" })
  started_by!: string;

  @Column({ type: "date" })
  start_date!: string;

  @Column({ type: "date" })
  end_date!: string;

  @Column({ type: "integer", nullable: true })
  agreed_price!: number | null;

  @Column({
    type: "enum",
    enum: RentStatus,
    enumName: "rent_status",
    default: RentStatus.PENDING,
  })
  status!: RentStatus;

  @Column({ type: "timestamptz", nullable: true })
  owner_confirmed_at!: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  renter_confirmed_at!: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  handed_over_at!: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  ended_at!: Date | null;

  @Column({ type: "timestamptz" })
  created_at!: Date;

  @Column({ type: "timestamptz" })
  updated_at!: Date;
}
