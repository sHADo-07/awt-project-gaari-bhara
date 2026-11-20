import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { RentStatus } from "@/modules/rent/rent.constants";

const UUID_PATTERN =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

// Only the format YYYY-MM-DD is allowed, for example 2026-12-05
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export class CreateRentDto {
  @ApiProperty({ description: "UUID of the post" })
  @IsString()
  @IsNotEmpty({ message: "No post ID provided" })
  @Matches(UUID_PATTERN, { message: "Invalid post ID format" })
  post_id!: string;

  @ApiProperty({ description: "First rental day", example: "2026-12-01" })
  @IsDateString({ strict: true })
  @Matches(DATE_ONLY, { message: "start_date must be in the format YYYY-MM-DD" })
  start_date!: string;

  @ApiProperty({ description: "Last rental day", example: "2026-12-05" })
  @IsDateString({ strict: true })
  @Matches(DATE_ONLY, { message: "end_date must be in the format YYYY-MM-DD" })
  end_date!: string;

  @ApiPropertyOptional({ description: "Agreed price in poisha", minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  agreed_price?: number;
}

export class UpdateRentDto {
  @ApiPropertyOptional({ description: "First rental day", example: "2026-12-01" })
  @IsOptional()
  @IsDateString({ strict: true })
  start_date?: string;

  @ApiPropertyOptional({ description: "Last rental day", example: "2026-12-05" })
  @IsOptional()
  @IsDateString({ strict: true })
  end_date?: string;

  @ApiPropertyOptional({ description: "Agreed price in poisha", minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  agreed_price?: number | null;

  @ApiPropertyOptional({ enum: RentStatus })
  @IsOptional()
  @IsEnum(RentStatus)
  status?: RentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  owner_confirmed_at?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  renter_confirmed_at?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  handed_over_at?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  ended_at?: string | null;
}
