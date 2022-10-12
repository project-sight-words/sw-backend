import { Exclude, Expose } from "class-transformer";
import { IsEmail, IsNotEmpty } from "class-validator";

@Exclude()
export class StudentDto {
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  email!: string;

  @IsNotEmpty()
  @Expose({ name: "student_id" })
  studentId!: string;

  @IsNotEmpty()
  @Expose()
  name!: string;
}
