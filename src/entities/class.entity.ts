import { Expose } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsMilitaryTime,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  Max,
  Min,
} from "class-validator";

export class Class {
  @IsNotEmpty()
  @IsUUID()
  @Expose()
  id!: string;

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

export class ClassTeacher {
  @IsNotEmpty()
  @IsUUID()
  @Expose({ name: "teacher_id" })
  teacherId!: string;

  @IsNotEmpty()
  @IsUUID()
  @Expose({ name: "class_id" })
  classId!: string;

  @IsNotEmpty()
  @IsBoolean()
  @Expose({ name: "is_form_teacher" })
  isFormTeacher!: boolean;

  @IsNotEmpty()
  @Expose({ name: "created_at" })
  @IsDate()
  createdAt!: Date;

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

export class ClassStudent {
  @IsNotEmpty()
  @IsUUID()
  @Expose({ name: "student_id" })
  studentId!: string;

  @IsNotEmpty()
  @IsUUID()
  @Expose({ name: "class_id" })
  classId!: string;

  @IsNotEmpty()
  @Expose({ name: "created_at" })
  @IsDate()
  createdAt!: Date;

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
