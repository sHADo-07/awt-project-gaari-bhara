import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@/common/guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/interfaces/auth-user.interface";
import { CreateReviewDto, ReviewVisibilityDto } from "./dto/review.dto";
import { ReviewService } from "./review.service";

@ApiTags("review")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("reviews")
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /** Login user review dibe, author ID body-te dorkar nei. */
  @Post()
  @ApiOperation({ summary: "Review an ended rent" })
  createReview(@Body() dto: CreateReviewDto, @CurrentUser() user: AuthUser) {
    return this.reviewService.createReview(dto, user);
  }

  /** Shob visible reviews. */
  @Get()
  @ApiOperation({ summary: "List visible reviews" })
  getReviews() {
    return this.reviewService.getReviews();
  }

  @Get("rent/:rentId")
  @ApiOperation({ summary: "Get visible reviews for a rent" })
  getReviewsByRentId(@Param("rentId", ParseUUIDPipe) rentId: string) {
    return this.reviewService.getReviewsByRentId(rentId);
  }

  @Get("subject/:subjectId")
  @ApiOperation({ summary: "Get visible reviews received by a user" })
  getReviewsBySubjectId(@Param("subjectId", ParseUUIDPipe) subjectId: string) {
    return this.reviewService.getReviewsBySubjectId(subjectId);
  }

  @Get("subject/:subjectId/average")
  @ApiOperation({ summary: "Get a user's average rating" })
  getAverageRatingByUser(@Param("subjectId", ParseUUIDPipe) subjectId: string) {
    return this.reviewService.getAverageRatingByUser(subjectId);
  }

  @Get("post/:postId")
  @ApiOperation({ summary: "Get visible reviews linked to a post" })
  getReviewsByPostId(@Param("postId", ParseUUIDPipe) postId: string) {
    return this.reviewService.getReviewsByPostId(postId);
  }

  @Get("post/:postId/average")
  @ApiOperation({ summary: "Get a post's average rating" })
  getAverageRatingByPost(@Param("postId", ParseUUIDPipe) postId: string) {
    return this.reviewService.getAverageRatingByPost(postId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get one visible review" })
  getReviewById(@Param("id", ParseUUIDPipe) id: string) {
    return this.reviewService.getReviewById(id);
  }

  /** Only ADMIN can hide/unhide; public update/delete are removed. */
  @Patch(":id/hide")
  @HttpCode(200)
  @ApiOperation({ summary: "Admin: hide or unhide a review" })
  hideReview(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ReviewVisibilityDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reviewService.hideReview(id, dto.is_hidden, user);
  }
}
