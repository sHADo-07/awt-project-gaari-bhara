import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@/common/guard/auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/interfaces/auth-user.interface";
import { CreateRentDto, RentActionDto } from "./dto/rent.dto";
import { RentService } from "./rent.service";

@ApiTags("Rent")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("rents")
export class RentController {
  constructor(private readonly rents: RentService) {}

  @Post()
  @ApiOperation({ summary: "Start a rental request (PENDING)" })
  start(@CurrentUser() user: AuthUser, @Body() dto: CreateRentDto) {
    return this.rents.startRent(user, dto);
  }

  @Get("my")
  @ApiOperation({ summary: "List the rentals I own or rent" })
  mine(@CurrentUser() user: AuthUser) {
    return this.rents.getMyRents(user);
  }

  @Get(":id/history")
  @ApiOperation({ summary: "Get history of a rental (participant or admin)" })
  history(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.rents.getRentHistory(id, user);
  }

  @Get(":id/contact")
  @ApiOperation({ summary: "Other participant contact, only after confirmation" })
  contact(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.rents.getParticipantContact(id, user);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a rental (participant or admin)" })
  one(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.rents.getRentById(id, user);
  }

  @Post(":id/confirm")
  @HttpCode(200)
  @ApiOperation({ summary: "Post author confirms a pending rental" })
  confirm(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser, @Body() dto: RentActionDto) {
    return this.rents.confirmRent(id, user.id, dto.note);
  }

  @Post(":id/decline")
  @HttpCode(200)
  @ApiOperation({ summary: "Post author declines a pending rental" })
  decline(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser, @Body() dto: RentActionDto) {
    return this.rents.declineRent(id, user.id, dto.note);
  }

  @Post(":id/cancel")
  @HttpCode(200)
  @ApiOperation({ summary: "Either participant cancels before handover" })
  cancel(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser, @Body() dto: RentActionDto) {
    return this.rents.cancelRent(id, user.id, dto.note);
  }

  @Post(":id/handover")
  @HttpCode(200)
  @ApiOperation({ summary: "Owner marks vehicle handed over" })
  handover(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser, @Body() dto: RentActionDto) {
    return this.rents.handoverRent(id, user.id, dto.note);
  }

  @Post(":id/end")
  @HttpCode(200)
  @ApiOperation({ summary: "Renter ends the rental" })
  end(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser, @Body() dto: RentActionDto) {
    return this.rents.endRent(id, user.id, dto.note);
  }
}
