import { Exclude, Expose } from "class-transformer";
import { IsEmail, IsNotEmpty } from "class-validator";

export class UpdateStudentDto {
  @IsNotEmpty()
  @Expose()
  name!: string;
}

@Exclude()
export class StudentDto extends UpdateStudentDto {
  @IsNotEmpty()
  @Expose({ name: "student_id" })
  studentId!: string;

  @IsNotEmpty()
  @IsEmail()
  @Expose()
  email!: string;
}
