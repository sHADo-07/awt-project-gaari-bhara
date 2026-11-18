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
import { CreateRentDto, UpdateRentDto } from "@/modules/rent/dto/rent.dto";
import { RentService } from "@/modules/rent/rent.service";

@ApiTags("rent")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("rents")
export class RentController {
  constructor(private readonly rentService: RentService) {}

  @Post()
  @ApiOperation({ summary: "Create a new rent" })
  async createRent(@Body() dto: CreateRentDto) {
    return this.rentService.createRent(dto);
  }

  @Get()
  @ApiOperation({ summary: "Get all rents" })
  async getRents() {
    return this.rentService.getRents();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a rent by ID" })
  async getRentById(@Param("id") id: string) {
    return this.rentService.getRentById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a rent" })
  async updateRent(@Param("id") id: string, @Body() dto: UpdateRentDto) {
    return this.rentService.updateRent(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a rent" })
  async deleteRent(@Param("id") id: string) {
    return this.rentService.deleteRent(id);
  }
}
