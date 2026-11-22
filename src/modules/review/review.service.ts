import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Role } from "@/common/enums/role.enum";
import { AuthUser } from "@/common/interfaces/auth-user.interface";
import { Post } from "@/modules/post/entities/post.entity";
import { Rent } from "@/modules/rent/entities/rent.entity";
import { RentStatus } from "@/modules/rent/rent.constants";
import { CreateReviewDto } from "./dto/review.dto";
import { Review } from "./entities/review.entity";

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Rent)
    private readonly rentRepository: Repository<Rent>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async getReviews(): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { is_hidden: false },
      order: { created_at: "DESC" },
    });
  }

  async getReviewById(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id, is_hidden: false },
    });
    if (!review) throw new NotFoundException("Review not found");
    return review;
  }

  async getReviewsByRentId(rentId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { rent_id: rentId, is_hidden: false },
      order: { created_at: "DESC" },
    });
  }

  async getReviewsBySubjectId(subjectId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { subject_id: subjectId, is_hidden: false },
      order: { created_at: "DESC" },
    });
  }

  async getReviewsByPostId(postId: string): Promise<Review[]> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException("Post not found");

    const rents = await this.rentRepository.find({ where: { post_id: postId } });
    if (rents.length === 0) return [];

    return this.reviewRepository.find({
      where: { rent_id: In(rents.map((rent) => rent.id)), is_hidden: false },
      order: { created_at: "DESC" },
    });
  }

  private calculateAverage(reviews: Review[]) {
    const count = reviews.length;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return { averageRating: count ? Number((total / count).toFixed(2)) : 0, reviewCount: count };
  }

  async getAverageRatingByUser(userId: string) {
    const reviews = await this.getReviewsBySubjectId(userId);
    return { userId, ...this.calculateAverage(reviews) };
  }

  async getAverageRatingByPost(postId: string) {
    const reviews = await this.getReviewsByPostId(postId);
    return { postId, ...this.calculateAverage(reviews) };
  }
  async createReview(dto: CreateReviewDto, user: AuthUser): Promise<Review> {
    const rent = await this.rentRepository.findOne({ where: { id: dto.rent_id } });
    if (!rent) throw new NotFoundException("Rent not found");

    if (rent.owner_id !== user.id && rent.renter_id !== user.id) {
      throw new ForbiddenException("Only rent participants can write a review");
    }
    if (rent.status !== RentStatus.ENDED) {
      throw new ConflictException("You can review only after the rent has ended");
    }
    if (!dto.comment.trim()) {
      throw new BadRequestException("Review comment cannot be blank");
    }

    const existing = await this.reviewRepository.findOne({
      where: { rent_id: rent.id, author_id: user.id },
    });
    if (existing) throw new ConflictException("You have already reviewed this rent");

    const subjectId = user.id === rent.owner_id ? rent.renter_id : rent.owner_id;
    const review = this.reviewRepository.create({
      rent_id: rent.id,
      author_id: user.id,
      subject_id: subjectId,
      rating: dto.rating,
      comment: dto.comment,
      is_hidden: false,
    });

    try {
      return await this.reviewRepository.save(review);
    } catch (error: unknown) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException("You have already reviewed this rent");
      }
      throw error;
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    if (!error || typeof error !== "object") return false;
    const err = error as { code?: string; driverError?: { code?: string } };
    return err.code === "23505" || err.driverError?.code === "23505";
  }

  async hideReview(id: string, isHidden: boolean, user: AuthUser): Promise<Review> {
    if (!user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException("Only admins can hide or show reviews");
    }

    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException("Review not found");

    review.is_hidden = isHidden;
    return this.reviewRepository.save(review);
  }
}
