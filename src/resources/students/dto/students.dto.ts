import { Exclude, Expose } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class UpdateStudentDto {
  @IsNotEmpty()
  @Expose()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @Expose({ name: "student_id" })
  @IsString()
  studentId!: string;
}

export class CreateStudentDto extends UpdateStudentDto {
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  email!: string;
}

@Exclude()
export class StudentDto extends CreateStudentDto {
  @IsNotEmpty()
  @Expose({ name: "id" })
  @IsUUID()
  id!: string;
}

// TODO: Create GetStudentsDto for get method in controller
// TODO: Create GetStudentDto for getById method in controller
// TODO: Create CreateStudentDto for create method in controller
