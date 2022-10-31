import { Exclude, Expose } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UpdateStudentDto {
  @IsNotEmpty()
  @Expose()
  @IsString()
  name!: string;

  // TODO: Update DTO should include studentId as well
}

@Exclude()
export class StudentDto extends UpdateStudentDto {
  @IsNotEmpty()
  @Expose({ name: "student_id" })
  @IsString()
  studentId!: string;

  @IsNotEmpty()
  @IsEmail()
  @Expose()
  email!: string;
}
