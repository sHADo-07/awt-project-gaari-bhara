import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@/common/guard";
import {
  CreateReviewDto,
  UpdateReviewDto,
} from "@/modules/review/dto/review.dto";
import { ReviewService } from "@/modules/review/review.service";

@ApiTags("review")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("reviews")
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiOperation({ summary: "Create a new review" })
  async createReview(@Body() dto: CreateReviewDto) {
    return this.reviewService.createReview(dto);
  }

  @Get()
  @ApiOperation({ summary: "Get all reviews" })
  async getReviews() {
    return this.reviewService.getReviews();
  }

  @Get("rent/:rentId")
  @ApiOperation({ summary: "Get reviews for a rent" })
  async getReviewsByRentId(@Param("rentId") rentId: string) {
    return this.reviewService.getReviewsByRentId(rentId);
  }

  @Get("subject/:subjectId")
  @ApiOperation({ summary: "Get visible reviews for a user" })
  async getReviewsBySubjectId(@Param("subjectId") subjectId: string) {
    return this.reviewService.getReviewsBySubjectId(subjectId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a review by ID" })
  async getReviewById(@Param("id") id: string) {
    return this.reviewService.getReviewById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a review" })
  async updateReview(@Param("id") id: string, @Body() dto: UpdateReviewDto) {
    return this.reviewService.updateReview(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a review" })
  async deleteReview(@Param("id") id: string) {
    return this.reviewService.deleteReview(id);
  }
}
