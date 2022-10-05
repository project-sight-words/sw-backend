/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Expose } from "class-transformer";
import { IsString, IsNotEmpty, IsEmail } from "class-validator";

export class CreateTeacherDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Expose({ name: "staff_id" })
  @IsString()
  @IsNotEmpty()
  staffId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;
}
