import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "@/common/enums/role.enum";
import { User, UserStatus } from "@/modules/users/entities/user.entity";
import { UpdateProfileDto } from "@/modules/users/dto/update-profile.dto";
import { ListUsersQueryDto } from "@/modules/users/dto/list-users-query.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async create(
    data: Pick<User, "role" | "fullName" | "email" | "phone" | "passwordHash">,
  ) {
    const taken = await this.users.findOne({
      where: [{ email: data.email }, { phone: data.phone }],
    });
    if (taken) {
      throw new ConflictException(
        taken.email === data.email
          ? "This email is already registered"
          : "This phone number is already registered",
      );
    }
    return this.users.save(this.users.create(data));
  }

  findById(id: string) {
    return this.users.findOne({ where: { id } });
  }

  findByEmailWithPassword(email: string) {
    return this.users
      .createQueryBuilder("u")
      .addSelect("u.passwordHash")
      .where("u.email = :email", { email })
      .getOne();
  }

  findByIdWithPassword(id: string) {
    return this.users
      .createQueryBuilder("u")
      .addSelect("u.passwordHash")
      .where("u.id = :id", { id })
      .getOne();
  }

  async setPassword(id: string, passwordHash: string) {
    await this.users.update(id, { passwordHash });
  }

  async getProfile(id: string) {
    return this.toProfile(await this.mustFind(id));
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    if (!dto.fullName && !dto.phone)
      throw new BadRequestException("Send fullName or phone");
    if (dto.phone) {
      const taken = await this.users.findOne({ where: { phone: dto.phone } });
      if (taken && taken.id !== id)
        throw new ConflictException("This phone number is already registered");
    }
    await this.users.update(id, dto);
    return this.toProfile(await this.mustFind(id));
  }

  async list(q: ListUsersQueryDto) {
    const qb = this.users
      .createQueryBuilder("u")
      .orderBy("u.createdAt", "DESC");
    if (q.role) qb.andWhere("u.role = :role", { role: q.role });
    if (q.status) qb.andWhere("u.status = :status", { status: q.status });
    if (q.q) {
      const like = `%${q.q.replace(/[%_\\]/g, "\\$&")}%`;
      qb.andWhere(
        "(u.fullName ILIKE :like OR u.email ILIKE :like OR u.phone ILIKE :like)",
        { like },
      );
    }
    const [items, total] = await qb
      .skip((q.page - 1) * q.limit)
      .take(q.limit)
      .getManyAndCount();
    return {
      items: items.map((u) => this.toProfile(u)),
      meta: {
        page: q.page,
        limit: q.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / q.limit)),
      },
    };
  }

  async getOne(id: string) {
    return this.toProfile(await this.mustFind(id));
  }

  async suspend(adminId: string, id: string) {
    if (adminId === id)
      throw new BadRequestException("You cannot suspend yourself");
    const user = await this.mustFind(id);
    if (user.role === Role.ADMIN)
      throw new ForbiddenException("An admin account cannot be suspended");
    if (user.status === UserStatus.SUSPENDED)
      throw new ConflictException("This user is already suspended");
    await this.users.update(id, { status: UserStatus.SUSPENDED });
    return this.getOne(id);
  }

  async restore(id: string) {
    const user = await this.mustFind(id);
    if (user.status === UserStatus.ACTIVE)
      throw new ConflictException("This user is not suspended");
    await this.users.update(id, { status: UserStatus.ACTIVE });
    return this.getOne(id);
  }

  async remove(adminId: string, id: string) {
    if (adminId === id)
      throw new BadRequestException("You cannot delete yourself");
    const user = await this.mustFind(id);
    if (user.role === Role.ADMIN)
      throw new ForbiddenException("An admin account cannot be deleted");
    await this.users.delete(id);
    return { message: "User deleted" };
  }

  toProfile(user: User) {
    return {
      id: user.id,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
    };
  }

  toPublic(user: User) {
    return { id: user.id, fullName: user.fullName, role: user.role };
  }

  private async mustFind(id: string) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }
}
