import { Expose } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsUUID,
} from "class-validator";

export class Class {
  @IsNotEmpty()
  @IsUUID()
  @Expose()
  id!: number;

  @IsNotEmpty()
  @IsDateString()
  @Expose({ name: "day_time" })
  dayTime!: Date;
}

export class TeacherToClass {
  @IsNotEmpty()
  @IsUUID()
  @Expose({ name: "teacher_id" })
  teacherId!: number;

  @IsNotEmpty()
  @IsUUID()
  @Expose({ name: "class_id" })
  classId!: number;

  @IsNotEmpty()
  @IsBoolean()
  @Expose({ name: "is_form_teacher" })
  isFormTeacher!: boolean;

  @IsNotEmpty()
  @Expose({ name: "created_at" })
  @IsDate()
  createdAt!: Date | null;

  @Expose({ name: "created_by" })
  @IsUUID()
  createdBy!: string | null;

  @Expose({ name: "deleted_at" })
  @IsDate()
  deletedAt!: Date | null;

  @Expose({ name: "deleted_by" })
  @IsUUID()
  deletedBy!: string | null;
}

export class StudentToClass {
  @IsNotEmpty()
  @IsUUID()
  @Expose({ name: "student_id" })
  studentId!: number;

  @IsNotEmpty()
  @IsUUID()
  @Expose({ name: "class_id" })
  classId!: number;

  @IsNotEmpty()
  @Expose({ name: "created_at" })
  @IsDate()
  createdAt!: Date | null;

  @Expose({ name: "created_by" })
  @IsUUID()
  createdBy!: string | null;

  @Expose({ name: "deleted_at" })
  @IsDate()
  deletedAt!: Date | null;

  @Expose({ name: "deleted_by" })
  @IsUUID()
  deletedBy!: string | null;
}
