import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";
import { lowerTrim } from "@/common/validations/transforms";

export class LoginDto {
  @ApiProperty({ example: "owner1@gaaribhara.test" })
  @Transform(({ value }) => lowerTrim(value))
  @IsEmail({}, { message: "email must be an email" })
  email!: string;

  @ApiProperty({ example: "Demo@12345" })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  password!: string;
}
