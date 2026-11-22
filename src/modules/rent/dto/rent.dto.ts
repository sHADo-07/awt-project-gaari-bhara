import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from "class-validator";
import { IsCalendarDate } from "@/modules/post/utils/calendar-date";

export class CreateRentDto {
  @ApiProperty({ format: "uuid", description: "Post to rent" })
  @IsUUID()
  post_id!: string;

  @ApiProperty({ example: "2026-12-01" })
  @IsCalendarDate()
  start_date!: string;

  @ApiProperty({ example: "2026-12-05" })
  @IsCalendarDate()
  end_date!: string;

  @ApiPropertyOptional({ description: "Agreed amount in poisha, not taka" })
  @IsOptional()
  @IsInt()
  @Min(0)
  agreed_price?: number;
}
export class RentActionDto {
  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
