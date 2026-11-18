import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RentStatusHistoryController } from "@/modules/rent_status_history/rent-status-history.controller";
import { RentStatusHistory } from "@/modules/rent_status_history/entities/rent-status-history.entity";
import { RentStatusHistoryService } from "@/modules/rent_status_history/rent-status-history.service";

@Module({
  imports: [TypeOrmModule.forFeature([RentStatusHistory])],
  controllers: [RentStatusHistoryController],
  providers: [RentStatusHistoryService],
  exports: [RentStatusHistoryService],
})
export class RentStatusHistoryModule {}
