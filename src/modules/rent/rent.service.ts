import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, In, Repository } from "typeorm";
import { AuthUser } from "@/common/interfaces/auth-user.interface";
import { Role } from "@/common/enums/role.enum";
import { Post } from "@/modules/post/entities/post.entity";
import { PostRentStatus, PostStatus, PostType } from "@/modules/post/posts.constants";
import { RentStatusHistory } from "@/modules/rent_status_history/entities/rent-status-history.entity";
import { User } from "@/modules/users/entities/user.entity";
import { CreateRentDto } from "./dto/rent.dto";
import { Rent } from "./entities/rent.entity";
import { canChangeRentStatus, RentStatus } from "./rent.constants";

@Injectable()
export class RentService {
  constructor(
    @InjectRepository(Rent)
    private readonly rentRepository: Repository<Rent>,
    private readonly dataSource: DataSource,
  ) {}

  private isAdmin(user: AuthUser): boolean {
    return user.roles.includes(Role.ADMIN);
  }

  private isParticipant(rent: Rent, user: AuthUser): boolean {
    return rent.owner_id === user.id || rent.renter_id === user.id;
  }

  private checkAccess(rent: Rent, user: AuthUser): void {
    if (!this.isParticipant(rent, user) && !this.isAdmin(user)) {
      throw new ForbiddenException("You cannot view this rent");
    }
  }

  private checkAction(rent: Rent, userId: string, action: "confirm" | "decline" | "cancel" | "handover" | "end", post: Post): void {
    if (action === "confirm" || action === "decline") {
      if (post.authorId !== userId) throw new ForbiddenException("Only the post author can respond to the request");
    } else if (action === "cancel") {
      if (rent.owner_id !== userId && rent.renter_id !== userId) {
        throw new ForbiddenException("Only the owner or renter can cancel");
      }
    } else if (action === "handover") {
      if (rent.owner_id !== userId) throw new ForbiddenException("Only the owner can hand over the vehicle");
    } else if (rent.renter_id !== userId) {
      throw new ForbiddenException("Only the renter can end the rent");
    }
  }

  private overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
    return aStart <= bEnd && bStart <= aEnd;
  }

  private async updatePostRentStatus(manager: EntityManager, post: Post): Promise<void> {
    const active = await manager.getRepository(Rent).find({
      where: { post_id: post.id, status: In([RentStatus.CONFIRMED, RentStatus.ONGOING]) },
    });

    post.rentStatus = active.some((rent) => rent.status === RentStatus.ONGOING)
      ? PostRentStatus.ON_RENT
      : active.length > 0
        ? PostRentStatus.BOOKED
        : PostRentStatus.OPEN;

    await manager.getRepository(Post).save(post);
  }

  private async recordStatusChange(
    manager: EntityManager,
    rent: Rent,
    oldStatus: RentStatus | null,
    userId: string | null,
    note?: string,
  ): Promise<void> {
    const entry = manager.getRepository(RentStatusHistory).create({
      rent_id: rent.id,
      old_status: oldStatus,
      new_status: rent.status,
      changed_by: userId,
      note: note ?? null,
    });
    await manager.getRepository(RentStatusHistory).save(entry);
  }

  async startRent(user: AuthUser, dto: CreateRentDto): Promise<Rent> {
    if (dto.end_date < dto.start_date) throw new BadRequestException("End date cannot be before start date");

    return this.dataSource.transaction(async (manager) => {
      const post = await manager.getRepository(Post).findOne({
        where: { id: dto.post_id },
        lock: { mode: "pessimistic_write" },
      });
      if (!post) throw new NotFoundException("Post not found");
      if (post.status !== PostStatus.ACTIVE) throw new ConflictException("Post is not active");
      if (post.authorId === user.id) throw new ForbiddenException("You cannot rent your own post");

      const renterStarts = post.postType === PostType.OFFER && user.roles.includes(Role.RENTER);
      const ownerStarts = post.postType === PostType.REQUEST && user.roles.includes(Role.OWNER);
      if (!renterStarts && !ownerStarts) {
        throw new ForbiddenException("Only renters can start OFFER rents and owners can start REQUEST rents");
      }
      if (post.postType === PostType.OFFER && (
        (post.dateFrom && dto.start_date < post.dateFrom) ||
        (post.dateTo && dto.end_date > post.dateTo)
      )) {
        throw new BadRequestException("Rent dates must be within the offered dates");
      }

      const ownerId = renterStarts ? post.authorId : user.id;
      const renterId = renterStarts ? user.id : post.authorId;
      const rents = manager.getRepository(Rent);

      const previous = await rents.findOne({
        where: { post_id: post.id, started_by: user.id, start_date: dto.start_date, end_date: dto.end_date, status: RentStatus.PENDING },
      });
      if (previous) return previous;

      const existing = await rents.find({
        where: { post_id: post.id, status: In([RentStatus.CONFIRMED, RentStatus.ONGOING]) },
      });
      if (existing.some((rent) => this.overlaps(rent.start_date, rent.end_date, dto.start_date, dto.end_date))) {
        throw new ConflictException("These dates are already booked");
      }

      const now = new Date();
      const rent = rents.create({
        post_id: post.id,
        owner_id: ownerId,
        renter_id: renterId,
        started_by: user.id,
        start_date: dto.start_date,
        end_date: dto.end_date,
        agreed_price: dto.agreed_price ?? null,
        status: RentStatus.PENDING,
        owner_confirmed_at: user.id === ownerId ? now : null,
        renter_confirmed_at: user.id === renterId ? now : null,
        handed_over_at: null,
        ended_at: null,
      });
      const saved = await rents.save(rent);
      await this.recordStatusChange(manager, saved, null, user.id, "Rent requested");
      return saved;
    });
  }

  private async moveRent(
    id: string,
    userId: string,
    action: "confirm" | "decline" | "cancel" | "handover" | "end",
    note?: string,
  ): Promise<Rent> {
    const next: Record<typeof action, RentStatus> = {
      confirm: RentStatus.CONFIRMED,
      decline: RentStatus.DECLINED,
      cancel: RentStatus.CANCELLED,
      handover: RentStatus.ONGOING,
      end: RentStatus.ENDED,
    };
    const target = next[action];

    return this.dataSource.transaction(async (manager) => {
      const rents = manager.getRepository(Rent);
      const reference = await rents.findOne({ where: { id } });
      if (!reference) throw new NotFoundException("Rent not found");

      const post = await manager.getRepository(Post).findOne({
        where: { id: reference.post_id },
        lock: { mode: "pessimistic_write" },
      });
      if (!post) throw new NotFoundException("Post not found");

      const rent = await rents.findOne({ where: { id }, lock: { mode: "pessimistic_write" } });
      if (!rent || rent.post_id !== post.id) throw new NotFoundException("Rent not found");
      this.checkAction(rent, userId, action, post);

      if (rent.status === target) return rent;
      if (!canChangeRentStatus(rent.status, target)) {
        throw new ConflictException(`Cannot ${action} a rent with status ${rent.status}`);
      }
      if (action === "confirm" && post.status !== PostStatus.ACTIVE) {
        throw new ConflictException("Post is not active");
      }

      const oldStatus = rent.status;
      const now = new Date();
      rent.status = target;
      if (action === "confirm") {
        if (rent.owner_id === userId) rent.owner_confirmed_at = now;
        if (rent.renter_id === userId) rent.renter_confirmed_at = now;
      }
      if (action === "handover") rent.handed_over_at = now;
      if (action === "end") rent.ended_at = now;

      await rents.save(rent);
      await this.recordStatusChange(manager, rent, oldStatus, userId, note ?? `Rent ${action}`);

      if (action === "confirm") {
        const pending = await rents.find({ where: { post_id: post.id, status: RentStatus.PENDING } });
        for (const other of pending) {
          if (!this.overlaps(other.start_date, other.end_date, rent.start_date, rent.end_date)) continue;
          other.status = RentStatus.DECLINED;
          await rents.save(other);
          await this.recordStatusChange(manager, other, RentStatus.PENDING, userId, "Another rent was confirmed for these dates");
        }
      }

      await this.updatePostRentStatus(manager, post);
      return rent;
    });
  }

  confirmRent(id: string, userId: string, note?: string) {
    return this.moveRent(id, userId, "confirm", note);
  }

  declineRent(id: string, userId: string, note?: string) {
    return this.moveRent(id, userId, "decline", note);
  }

  cancelRent(id: string, userId: string, note?: string) {
    return this.moveRent(id, userId, "cancel", note);
  }

  handoverRent(id: string, userId: string, note?: string) {
    return this.moveRent(id, userId, "handover", note);
  }

  endRent(id: string, userId: string, note?: string) {
    return this.moveRent(id, userId, "end", note);
  }

  async getMyRents(user: AuthUser): Promise<Rent[]> {
    return this.rentRepository.find({
      where: [{ owner_id: user.id }, { renter_id: user.id }],
      order: { created_at: "DESC" },
    });
  }

  async getRentById(id: string, user: AuthUser): Promise<Rent> {
    const rent = await this.rentRepository.findOne({ where: { id } });
    if (!rent) throw new NotFoundException("Rent not found");
    this.checkAccess(rent, user);
    return rent;
  }

  async getRentHistory(id: string, user: AuthUser): Promise<RentStatusHistory[]> {
    await this.getRentById(id, user);
    return this.dataSource.getRepository(RentStatusHistory).find({
      where: { rent_id: id }, order: { id: "ASC" },
    });
  }

  async getParticipantContact(id: string, user: AuthUser) {
    const rent = await this.getRentById(id, user);
    if (!this.isParticipant(rent, user)) {
      throw new ForbiddenException("Only rent participants can see contact details");
    }
    if (![RentStatus.CONFIRMED, RentStatus.ONGOING, RentStatus.ENDED].includes(rent.status)) {
      throw new ForbiddenException("Contact details are available only after confirmation");
    }

    const otherId = user.id === rent.owner_id ? rent.renter_id : rent.owner_id;
    const other = await this.dataSource.getRepository(User).findOne({ where: { id: otherId } });
    if (!other) throw new NotFoundException("Other participant not found");
    return { id: other.id, name: other.fullName, phone: other.phone, email: other.email };
  }
}
