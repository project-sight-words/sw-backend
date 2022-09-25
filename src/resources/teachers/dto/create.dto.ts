/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsNotEmpty } from "class-validator";

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty({ message: "Staff_id should not be empty" })
  staff_id!: string;

  @IsString()
  @IsNotEmpty({ message: "Name should not be empty" })
  name!: string;
}
