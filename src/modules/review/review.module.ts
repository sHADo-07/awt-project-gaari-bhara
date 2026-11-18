import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReviewController } from "@/modules/review/review.controller";
import { Review } from "@/modules/review/entities/review.entity";
import { ReviewService } from "@/modules/review/review.service";

@Module({
  imports: [TypeOrmModule.forFeature([Review])],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
