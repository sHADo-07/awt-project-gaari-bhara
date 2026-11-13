import { Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard, RolesGuard } from "@/common/guard";
import { CurrentUser, Roles } from "@/common/decorators";
import { Role } from "@/common/enums/role.enum";
import { AuthUser } from "@/common/interfaces/auth-user.interface";
import { UsersService } from "@/modules/users/users.service";
import { ListUsersQueryDto } from "@/modules/users/dto/list-users-query.dto";

@ApiTags("Admin: users")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller("admin/users")
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: "List users (filters: role, status, q; pages)" })
  list(@Query() query: ListUsersQueryDto) {
    return this.usersService.list(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "One user" })
  getOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.usersService.getOne(id);
  }

  @Patch(":id/suspend")
  @ApiOperation({ summary: "Suspend a user. They can no longer log in or use the API." })
  suspend(@CurrentUser() admin: AuthUser, @Param("id", ParseUUIDPipe) id: string) {
    return this.usersService.suspend(admin.id, id);
  }

  @Patch(":id/restore")
  @ApiOperation({ summary: "Let a suspended user back in" })
  restore(@Param("id", ParseUUIDPipe) id: string) {
    return this.usersService.restore(id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a user with no records (otherwise 409)" })
  remove(@CurrentUser() admin: AuthUser, @Param("id", ParseUUIDPipe) id: string) {
    return this.usersService.remove(admin.id, id);
  }
}
