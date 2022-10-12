import { Expose } from "class-transformer";
import { IsString, IsNotEmpty, IsEmail } from "class-validator";

export class CreateTeacherDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  staffId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;
}
