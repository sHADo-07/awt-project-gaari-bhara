import { Role } from "@/common/enums/role.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum UserStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "enum", enum: Role, enumName: "user_role" })
  role!: Role;

  @Column()
  fullName!: string;

  @Column()
  email!: string;

  @Column()
  phone!: string;

  @Column({ select: false })
  passwordHash!: string;

  @Column({
    type: "enum",
    enum: UserStatus,
    enumName: "user_status",
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @Column({ type: "timestamptz", nullable: true })
  emailVerifiedAt!: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
