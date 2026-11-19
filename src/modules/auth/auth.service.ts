import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { appConfig } from "@/config/app.config";
import { AuthUser } from "@/common/interfaces/auth-user.interface";
import { MailService } from "@/mails/mail.service";
import { UsersService } from "@/modules/users/users.service";
import { UserStatus } from "@/modules/users/entities/user.entity";
import { InMemoryCacheService } from "@/providers/cache/in-memory/in-memory-cache.service";
import { RegisterDto } from "@/modules/auth/dto/register.dto";
import { LoginDto } from "@/modules/auth/dto/login.dto";
import { ChangePasswordDto } from "@/modules/auth/dto/change-password.dto";

interface TokenPayload {
  sub: string;
  roles: string[];
  jti: string;
  exp: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly cache: InMemoryCacheService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await this.hashPassword(dto.password);
    const user = await this.usersService.create({
      role: dto.role,
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
    });
    void this.mailService.sendWelcome(user.email, user.fullName);
    return this.usersService.toProfile(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    const passwordOk = user
      ? await bcrypt.compare(dto.password, user.passwordHash)
      : false;

    if (!user || !passwordOk)
      throw new UnauthorizedException("Invalid email or password");
    this.ensureActive(user.status);

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      roles: [user.role],
      jti: randomUUID(),
    });
    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn: appConfig.env.JWT_TTL,
      user: this.usersService.toProfile(user),
    };
  }

  async verifyAuthToken(token: string): Promise<AuthUser> {
    let payload: TokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<TokenPayload>(token);
    } catch (_error) {
      throw new UnauthorizedException(
        "You are not authenticated, invalid or expired token",
      );
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user)
      throw new UnauthorizedException(
        "You are not authenticated, this user no longer exists",
      );
    this.ensureActive(user.status);
    return { id: user.id, email: user.email, roles: [user.role] };
  }

  logout(token: string) {
    const payload = this.jwtService.decode<TokenPayload>(token);
    const msLeft = payload.exp * 1000 - Date.now();

    this.cache.set(token, "blacklisted");

    setTimeout(
      () => this.cache.delete(token),
      Math.min(Math.max(msLeft, 0), 2_000_000_000),
    ).unref();
    return { message: "Logged out" };
  }

  async changePassword(userId: string, token: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findByIdWithPassword(userId);
    const currentOk = user
      ? await bcrypt.compare(dto.currentPassword, user.passwordHash)
      : false;
    if (!user || !currentOk)
      throw new UnauthorizedException("The current password is wrong");
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        "The new password must be different from the current password",
      );
    }

    const passwordHash = await this.hashPassword(dto.newPassword);
    await this.usersService.setPassword(userId, passwordHash);
    this.logout(token);
    return { message: "Password changed. Please log in again." };
  }

  private hashPassword(password: string) {
    return bcrypt.hash(password, appConfig.recommended_bycrypt_rounds);
  }

  private ensureActive(status: UserStatus) {
    if (status === UserStatus.SUSPENDED) {
      throw new ForbiddenException(
        "Your account is suspended. Please contact an admin.",
      );
    }
  }
}
