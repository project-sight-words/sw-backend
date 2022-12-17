import { Expose } from "class-transformer";
import { IsDate, IsEmail, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class NewStudent {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Expose({ name: "student_id" })
  @IsNotEmpty()
  @IsString()
  studentId!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;
}

export class Student {
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsEmail()
  email!: string | null;

  @Expose({ name: "student_id" })
  @IsNotEmpty()
  @IsString()
  studentId!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @Expose({ name: "updated_by" })
  @IsUUID()
  updatedBy!: string | null;

  @Expose({ name: "updated_at" })
  @IsDate()
  updatedAt!: Date;
}

export class NewStudentUser {
  @Expose({ name: "user_id" })
  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @Expose({ name: "student_id" })
  @IsNotEmpty()
  @IsUUID()
  studentId!: string;
}

export class StudentUser {
  @Expose({ name: "created_by" })
  @IsUUID()
  createdBy!: string | null;

  @Expose({ name: "created_at" })
  @IsDate()
  createdAt!: Date;
}
