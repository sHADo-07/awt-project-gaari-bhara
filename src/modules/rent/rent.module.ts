import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RentController } from "@/modules/rent/rent.controller";
import { Rent } from "@/modules/rent/entities/rent.entity";
import { RentService } from "@/modules/rent/rent.service";

@Module({
  imports: [TypeOrmModule.forFeature([Rent])],
  controllers: [RentController],
  providers: [RentService],
  exports: [RentService],
})
export class RentModule {}
