import { Expose } from "class-transformer";
import { IsBoolean, IsDateString, IsNotEmpty, IsUUID } from "class-validator";

export class UpdateClassDto {
  @IsNotEmpty()
  @IsDateString()
  @Expose({ name: "day_time" })
  dayTime!: Date;
}
export class AddTeacherToClassDto {
  @IsNotEmpty()
  @IsUUID()
  @Expose({ name: "teacher_id" })
  teacherId!: string;

  @IsNotEmpty()
  @IsBoolean()
  @Expose({ name: "is_form_teacher" })
  isFormTeacher!: boolean;
}

export class AddStudentToClassDto {
  @IsNotEmpty()
  @IsUUID()
  @Expose({ name: "student_id" })
  studentId!: string;
}
