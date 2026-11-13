import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcryptjs";
import { Seeder } from "nestjs-seeder";
import { In, Repository } from "typeorm";
import { appConfig } from "@/config/app.config";
import { Role } from "@/common/enums/role.enum";
import { User } from "@/modules/users/entities/user.entity";

/** Demo accounts for the whole team. All of them use the password below. DEMO ONLY. */
const DEMO_PASSWORD = "Demo@12345";

const DEMO_USERS = [
  { role: Role.ADMIN, fullName: "Admin Gaari", email: "admin@gaaribhara.test", phone: "01711000001" },
  { role: Role.OWNER, fullName: "Karim Owner", email: "owner1@gaaribhara.test", phone: "01711000011" },
  { role: Role.OWNER, fullName: "Salma Owner", email: "owner2@gaaribhara.test", phone: "01711000012" },
  { role: Role.OWNER, fullName: "Jamal Owner", email: "owner3@gaaribhara.test", phone: "01711000013" },
  { role: Role.RENTER, fullName: "Rahim Renter", email: "renter1@gaaribhara.test", phone: "01711000021" },
  { role: Role.RENTER, fullName: "Nusrat Renter", email: "renter2@gaaribhara.test", phone: "01711000022" },
  { role: Role.RENTER, fullName: "Tanvir Renter", email: "renter3@gaaribhara.test", phone: "01711000023" },
];

@Injectable()
export class UsersSeeder implements Seeder {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  /** Creates the demo users that are missing. Safe to run again. */
  async seed() {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, appConfig.recommended_bycrypt_rounds);
    for (const demo of DEMO_USERS) {
      const exists = await this.users.exist({ where: { email: demo.email } });
      if (!exists) await this.users.save(this.users.create({ ...demo, passwordHash }));
    }

    const all = await this.users.find({ where: { email: In(DEMO_USERS.map((u) => u.email)) }, order: { createdAt: "ASC" } });
    console.log(`Demo users (password: ${DEMO_PASSWORD}):`);
    for (const u of all) console.log(`  ${u.role.padEnd(7)} ${u.email.padEnd(26)} ${u.id}`);
  }

  /** Used by "pnpm seeder:refresh:dev". Deletes the demo users (a demo user who owns posts or rents cannot be deleted). */
  async drop() {
    await this.users.delete({ email: In(DEMO_USERS.map((u) => u.email)) });
  }
}
