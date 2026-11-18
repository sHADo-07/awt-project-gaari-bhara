import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  CreateReviewDto,
  UpdateReviewDto,
} from "@/modules/review/dto/review.dto";
import { Review } from "@/modules/review/entities/review.entity";

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async getReviews() {
    return this.reviewRepository.find({
      order: { created_at: "DESC" },
    });
  }

  async getReviewById(id: string) {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException("Review with ID not found");
    }
    return review;
  }

  async getReviewsByRentId(rentId: string) {
    return this.reviewRepository.find({
      where: { rent_id: rentId },
      order: { created_at: "DESC" },
    });
  }

  async getReviewsBySubjectId(subjectId: string) {
    return this.reviewRepository.find({
      where: { subject_id: subjectId, is_hidden: false },
      order: { created_at: "DESC" },
    });
  }

  async createReview(dto: CreateReviewDto) {
    const review = this.reviewRepository.create(dto);
    return this.reviewRepository.save(review);
  }

  async updateReview(id: string, dto: UpdateReviewDto) {
    const review = await this.getReviewById(id);
    Object.assign(review, dto);
    return this.reviewRepository.save(review);
  }

  async deleteReview(id: string) {
    await this.getReviewById(id);
    return this.reviewRepository.delete({ id });
  }
}
