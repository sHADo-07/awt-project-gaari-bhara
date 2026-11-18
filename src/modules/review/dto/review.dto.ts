import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  Matches,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

const UUID_PATTERN =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export class CreateReviewDto {
  @ApiProperty({ description: "UUID of the rent" })
  @IsString()
  @IsNotEmpty()
  @Matches(UUID_PATTERN, { message: "Invalid rent ID format" })
  rent_id!: string;

  @ApiProperty({ description: "UUID of the reviewing user" })
  @IsString()
  @IsNotEmpty()
  @Matches(UUID_PATTERN, { message: "Invalid author ID format" })
  author_id!: string;

  @ApiProperty({ description: "UUID of the reviewed user" })
  @IsString()
  @IsNotEmpty()
  @Matches(UUID_PATTERN, { message: "Invalid subject ID format" })
  subject_id!: string;

  @ApiProperty({ minimum: 1, maximum: 5, example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({ maxLength: 2000, example: "Great experience." })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  comment!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_hidden?: boolean;
}

export class UpdateReviewDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  comment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_hidden?: boolean;
}
