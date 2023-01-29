import { Exclude, Expose } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class StudentDatumDto {}

export class StudentEntityDto extends StudentDatumDto {}

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
