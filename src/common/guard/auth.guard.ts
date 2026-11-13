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

/**
 * The login check for every private route:  @UseGuards(AuthGuard)
 *   1. there must be a Bearer token                      (else 401)
 *   2. the token must not be logged out                  (else 401)
 *   3. the token must be real and not expired            (else 401)
 *   4. the account must be active                        (else 403)
 * Then the user is saved in req.user, for @CurrentUser() and for the RolesGuard.
 */
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

    // Logout puts the token in the cache as "blacklisted".
    if (this.cache.get(token) === "blacklisted") {
      throw new UnauthorizedException(
        "Session expired or logged out. Please login again.",
      );
    }

    req.user = await this.authService.verifyAuthToken(token);
    return true;
  }
}
