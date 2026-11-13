import { Body, Controller, HttpCode, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@/common/guard";
import { CurrentUser } from "@/common/decorators";
import { getBearerToken } from "@/common/helpers/auth.helper";
import { AuthUser } from "@/common/interfaces/auth-user.interface";
import { IRequest } from "@/common/interfaces/request.interface";
import { AuthService } from "@/modules/auth/auth.service";
import { RegisterDto } from "@/modules/auth/dto/register.dto";
import { LoginDto } from "@/modules/auth/dto/login.dto";
import { ChangePasswordDto } from "@/modules/auth/dto/change-password.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Sign up as RENTER or OWNER (ADMIN is refused)" })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Log in with email and password. Returns a Bearer token." })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("logout")
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Log out. This token stops working at once." })
  logout(@Req() req: IRequest) {
    return this.authService.logout(getBearerToken(req) as string);
  }

  @Patch("password")
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Change my password. This token stops working, so log in again." })
  changePassword(@CurrentUser() user: AuthUser, @Req() req: IRequest, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, getBearerToken(req) as string, dto);
  }
}
