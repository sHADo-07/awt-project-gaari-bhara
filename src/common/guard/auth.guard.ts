import { IRequest } from "@/common/interfaces/request.interface";
import { getBearerToken } from "@/common/helpers/auth.helper";
import { AuthService } from "@/modules/auth/auth.service";
import { InMemoryCacheService } from "@/providers/cache/in-memory/in-memory-cache.service";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly cache: InMemoryCacheService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const req: IRequest = context.switchToHttp().getRequest();
    const token = getBearerToken(req);

    if (!token)
      throw new UnauthorizedException(
        "You are not authenticated, missing bearer token",
      );

    if (this.cache.get(token) === "blacklisted") {
      throw new UnauthorizedException(
        "Session expired or logged out. Please login again.",
      );
    }

    req.user = await this.authService.verifyAuthToken(token);
    return true;
  }
}
