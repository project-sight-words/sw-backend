import { Expose } from "class-transformer";
import { IsEmail, IsNotEmpty } from "class-validator";

export class StudentDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Expose({ name: "student_id" })
  @IsNotEmpty()
  studentId!: string;

  @IsNotEmpty()
  name!: string;
}
