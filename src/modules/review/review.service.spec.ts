import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { Role } from "@/common/enums/role.enum";
import { RentStatus } from "@/modules/rent/rent.constants";
import { ReviewService } from "./review.service";

describe("ReviewService", () => {
  const owner = { id: "owner-1", roles: [Role.OWNER] };
  const renter = { id: "renter-1", roles: [Role.RENTER] };
  const stranger = { id: "stranger-1", roles: [Role.RENTER] };
  const admin = { id: "admin-1", roles: [Role.ADMIN] };
  const rent = {
    id: "rent-1", post_id: "post-1", owner_id: owner.id, renter_id: renter.id,
    status: RentStatus.ENDED,
  };
  const dto = { rent_id: rent.id, rating: 5, comment: "Nice vehicle" };

  let reviews: any;
  let rents: any;
  let posts: any;
  let service: ReviewService;

  beforeEach(() => {
    reviews = {
      find: jest.fn<() => Promise<any[]>>().mockResolvedValue([]),
      findOne: jest.fn<() => Promise<any>>().mockResolvedValue(null),
      create: jest.fn((data: any) => ({ ...data })),
      save: jest.fn(async (data: any) => ({ id: "review-1", ...data })),
    };
    rents = { findOne: jest.fn<() => Promise<any>>().mockResolvedValue({ ...rent }), find: jest.fn<() => Promise<any[]>>().mockResolvedValue([{ ...rent }]) };
    posts = { findOne: jest.fn<() => Promise<any>>().mockResolvedValue({ id: rent.post_id }) };
    service = new ReviewService(reviews, rents, posts);
  });

  it("creates a review with author from JWT and the other participant as subject", async () => {
    const result = await service.createReview(dto, renter);
    expect(reviews.create).toHaveBeenCalledWith(expect.objectContaining({
      author_id: renter.id, subject_id: owner.id, is_hidden: false, rating: 5,
    }));
    expect(result.comment).toBe(dto.comment);
  });

  it("blocks anyone outside the rental", async () => {
    await expect(service.createReview(dto, stranger)).rejects.toBeInstanceOf(ForbiddenException);
    expect(reviews.save).not.toHaveBeenCalled();
  });

  it("blocks reviews before ENDED", async () => {
    rents.findOne.mockResolvedValue({ ...rent, status: RentStatus.ONGOING });
    await expect(service.createReview(dto, renter)).rejects.toBeInstanceOf(ConflictException);
  });

  it("blocks duplicate reviews by the same user", async () => {
    reviews.findOne.mockResolvedValue({ id: "old-review" });
    await expect(service.createReview(dto, renter)).rejects.toBeInstanceOf(ConflictException);
  });

  it("blocks comments that contain only spaces", async () => {
    await expect(service.createReview({ ...dto, comment: "   " }, renter)).rejects.toBeInstanceOf(BadRequestException);
  });

  it("returns only visible reviews for a subject", async () => {
    await service.getReviewsBySubjectId(owner.id);
    expect(reviews.find).toHaveBeenCalledWith(expect.objectContaining({
      where: { subject_id: owner.id, is_hidden: false },
    }));
  });

  it("calculates average ratings and handles no reviews", async () => {
    reviews.find.mockResolvedValue([{ rating: 5 }, { rating: 4 }, { rating: 3 }]);
    await expect(service.getAverageRatingByUser(owner.id)).resolves.toEqual({
      userId: owner.id, averageRating: 4, reviewCount: 3,
    });
    reviews.find.mockResolvedValue([]);
    await expect(service.getAverageRatingByUser(owner.id)).resolves.toEqual({
      userId: owner.id, averageRating: 0, reviewCount: 0,
    });
  });

  it("returns reviews belonging to all rents of a post", async () => {
    await service.getReviewsByPostId("post-1");
    expect(reviews.find).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ is_hidden: false }),
    }));
  });

  it("returns 404 if the post does not exist", async () => {
    posts.findOne.mockResolvedValue(null);
    await expect(service.getReviewsByPostId("missing")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("allows admin to hide but blocks a normal user", async () => {
    reviews.findOne.mockResolvedValue({ id: "review-1", is_hidden: false });
    await expect(service.hideReview("review-1", true, renter)).rejects.toBeInstanceOf(ForbiddenException);
    const result = await service.hideReview("review-1", true, admin);
    expect(result.is_hidden).toBe(true);
  });
});
