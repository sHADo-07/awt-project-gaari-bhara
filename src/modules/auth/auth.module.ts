import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { appConfig } from "@/config/app.config";
import { UsersModule } from "@/modules/users/users.module";
import { AuthController } from "@/modules/auth/auth.controller";
import { AuthService } from "@/modules/auth/auth.service";

/**
 * GLOBAL: every module can use  @UseGuards(AuthGuard)  without importing AuthModule.
 * The secret and the token life come from .env (JWT_BEARER_SECRET, JWT_TTL).
 */
@Global()
@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: appConfig.env.JWT_BEARER_SECRET,
      signOptions: { expiresIn: appConfig.env.JWT_TTL },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
