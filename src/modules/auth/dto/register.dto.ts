import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsIn, IsString, Length, Matches, MaxLength } from "class-validator";
import { Role } from "@/common/enums/role.enum";
import { lowerTrim, normalizePhone, trim } from "@/common/validations/transforms";

export class RegisterDto {
  @ApiProperty({ example: "Rahim Uddin" })
  @Transform(({ value }) => trim(value))
  @IsString()
  @Length(2, 80)
  @Matches(/^[\p{L}][\p{L} .'-]*$/u, { message: "fullName can only have letters, spaces, dots, apostrophes and hyphens" })
  fullName!: string;

  @ApiProperty({ example: "rahim@example.com" })
  @Transform(({ value }) => lowerTrim(value))
  @IsEmail({}, { message: "email must be an email" })
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: "01712345678", description: "Bangladesh mobile number" })
  @Transform(({ value }) => normalizePhone(value))
  @Matches(/^01[3-9]\d{8}$/, { message: "phone must be a Bangladesh mobile number like 01712345678" })
  phone!: string;

  @ApiProperty({ example: "Secret1234", description: "8 to 64 characters, at least one letter and one number" })
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,64}$/, {
    message: "password must be 8 to 64 characters with at least one letter and one number",
  })
  password!: string;

  @ApiProperty({ enum: [Role.OWNER, Role.RENTER], description: "ADMIN accounts cannot be created here" })
  @IsIn([Role.OWNER, Role.RENTER], { message: "role must be OWNER or RENTER" })
  role!: Role.OWNER | Role.RENTER;
}
