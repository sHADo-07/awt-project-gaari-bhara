import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@/common/guard";
import {
  CreateRentStatusHistoryDto,
  UpdateRentStatusHistoryDto,
} from "@/modules/rent_status_history/dto/rent-status-history.dto";
import { RentStatusHistoryService } from "@/modules/rent_status_history/rent-status-history.service";

@ApiTags("rent-status-history")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("rent-status-history")
export class RentStatusHistoryController {
  constructor(
    private readonly rentStatusHistoryService: RentStatusHistoryService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a rent status history entry" })
  async createRentStatusHistory(@Body() dto: CreateRentStatusHistoryDto) {
    return this.rentStatusHistoryService.createRentStatusHistory(dto);
  }

  @Get()
  @ApiOperation({ summary: "Get all rent status history entries" })
  async getRentStatusHistories() {
    return this.rentStatusHistoryService.getRentStatusHistories();
  }

  @Get("rent/:rentId")
  @ApiOperation({ summary: "Get status history for a rent" })
  async getRentStatusHistoryByRentId(@Param("rentId") rentId: string) {
    return this.rentStatusHistoryService.getRentStatusHistoryByRentId(rentId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a rent status history entry by ID" })
  async getRentStatusHistoryById(@Param("id") id: string) {
    return this.rentStatusHistoryService.getRentStatusHistoryById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a rent status history entry" })
  async updateRentStatusHistory(
    @Param("id") id: string,
    @Body() dto: UpdateRentStatusHistoryDto,
  ) {
    return this.rentStatusHistoryService.updateRentStatusHistory(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a rent status history entry" })
  async deleteRentStatusHistory(@Param("id") id: string) {
    return this.rentStatusHistoryService.deleteRentStatusHistory(id);
  }
}
