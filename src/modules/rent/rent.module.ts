import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Post } from "@/modules/post/entities/post.entity";
import { User } from "@/modules/users/entities/user.entity";
import { RentStatusHistory } from "@/modules/rent_status_history/entities/rent-status-history.entity";
import { Rent } from "./entities/rent.entity";
import { RentController } from "./rent.controller";
import { RentService } from "./rent.service";

@Module({
  imports: [TypeOrmModule.forFeature([Rent, Post, User, RentStatusHistory])],
  controllers: [RentController],
  providers: [RentService],
  exports: [RentService],
})
export class RentModule {}
