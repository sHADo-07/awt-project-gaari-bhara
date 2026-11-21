import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Post } from "@/modules/post/entities/post.entity";
import { Rent } from "@/modules/rent/entities/rent.entity";
import { ReviewController } from "./review.controller";
import { Review } from "./entities/review.entity";
import { ReviewService } from "./review.service";

@Module({
  imports: [TypeOrmModule.forFeature([Review, Rent, Post])],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
