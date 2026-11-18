import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { RentStatus } from "@/modules/rent/rent.constants";

const UUID_PATTERN =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export class CreateRentStatusHistoryDto {
  @ApiProperty({ description: "UUID of the rent" })
  @IsString()
  @IsNotEmpty()
  @Matches(UUID_PATTERN, { message: "Invalid rent ID format" })
  rent_id!: string;

  @ApiPropertyOptional({ enum: RentStatus, nullable: true })
  @IsOptional()
  @IsEnum(RentStatus)
  old_status?: RentStatus | null;

  @ApiProperty({ enum: RentStatus })
  @IsEnum(RentStatus)
  new_status!: RentStatus;

  @ApiPropertyOptional({
    description: "UUID of the user who changed the status",
  })
  @IsOptional()
  @IsString()
  @Matches(UUID_PATTERN, { message: "Invalid changed by ID format" })
  changed_by?: string | null;

  @ApiPropertyOptional({ description: "Reason for the status change" })
  @IsOptional()
  @IsString()
  note?: string | null;
}

export class UpdateRentStatusHistoryDto {
  @ApiPropertyOptional({ enum: RentStatus, nullable: true })
  @IsOptional()
  @IsEnum(RentStatus)
  old_status?: RentStatus | null;

  @ApiPropertyOptional({ enum: RentStatus })
  @IsOptional()
  @IsEnum(RentStatus)
  new_status?: RentStatus;

  @ApiPropertyOptional({
    description: "UUID of the user who changed the status",
  })
  @IsOptional()
  @IsString()
  @Matches(UUID_PATTERN, { message: "Invalid changed by ID format" })
  changed_by?: string | null;

  @ApiPropertyOptional({ description: "Reason for the status change" })
  @IsOptional()
  @IsString()
  note?: string | null;
}
