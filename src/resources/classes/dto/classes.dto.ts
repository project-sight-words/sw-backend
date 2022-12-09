import { Expose } from "class-transformer";
import {
  IsBoolean,
  IsMilitaryTime,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  Max,
  Min,
} from "class-validator";

export class UpdateClassDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(7)
  @Expose({ name: "day" })
  day!: number;

  @IsNotEmpty()
  @IsMilitaryTime()
  @Expose({ name: "time" })
  time!: string;
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
