import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNotEmpty, IsString, IsUUID, Max, MaxLength, Min } from "class-validator";

export class CreateReviewDto {
  @ApiProperty({ description: "ID of an ENDED rent" })
  @IsUUID()
  rent_id!: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({ example: "Great rental experience!", maxLength: 2000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  comment!: string;
}

export class ReviewVisibilityDto {
  @ApiProperty({ description: "true = hide review, false = show review", default: true })
  @IsBoolean()
  is_hidden!: boolean;
}
