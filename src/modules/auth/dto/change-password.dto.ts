import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty({ example: "Demo@12345" })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  currentPassword!: string;

  @ApiProperty({ example: "NewSecret5678" })
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,64}$/, {
    message: "newPassword must be 8 to 64 characters with at least one letter and one number",
  })
  newPassword!: string;
}
