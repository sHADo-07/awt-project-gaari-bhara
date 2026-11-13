import { seeder } from "nestjs-seeder";
import { TypeOrmModule } from "@nestjs/typeorm";
import dataSourceOptions from "./config/database.config";
import { User } from "@/modules/users/entities/user.entity";
import { UsersSeeder } from "@/database/seeders/users.seeder";

// pnpm seeder:run:dev       -> adds the demo users
// pnpm seeder:refresh:dev   -> deletes the demo users, then adds them again
seeder({
  imports: [TypeOrmModule.forRoot(dataSourceOptions), TypeOrmModule.forFeature([User])],
}).run([UsersSeeder]);
