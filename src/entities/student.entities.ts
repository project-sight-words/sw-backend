import { Expose, Type } from "class-transformer";
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

export class Student extends NewStudent {
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @Expose({ name: "updated_by" })
  @IsUUID()
  updatedBy!: string | null;

  @Expose({ name: "updated_at" })
  @IsDate()
  updatedAt!: Date;

  @Type(() => StudentUser)
  studentUser!: StudentUser | null;
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
