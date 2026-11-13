import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsString, Length, Matches } from "class-validator";
import { normalizePhone, trim } from "@/common/validations/transforms";

/** Every field is optional. Only the fields you send are changed. Email and role cannot be changed here. */
export class UpdateProfileDto {
  @ApiPropertyOptional({ example: "Rahim Uddin" })
  @IsOptional()
  @Transform(({ value }) => trim(value))
  @IsString()
  @Length(2, 80)
  @Matches(/^[\p{L}][\p{L} .'-]*$/u, { message: "fullName can only have letters, spaces, dots, apostrophes and hyphens" })
  fullName?: string;

  @ApiPropertyOptional({ example: "01712345678" })
  @IsOptional()
  @Transform(({ value }) => normalizePhone(value))
  @Matches(/^01[3-9]\d{8}$/, { message: "phone must be a Bangladesh mobile number like 01712345678" })
  phone?: string;
}
