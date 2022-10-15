import { Expose } from "class-transformer";
import { IsDate, IsNotEmpty, IsUUID, IsString, IsEmail } from "class-validator";

export class NewTeacher {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Expose({ name: "staff_id" })
  @IsNotEmpty()
  @IsString()
  staffId!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;
}

export class Teacher extends NewTeacher {
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @Expose({ name: "updated_at" })
  @IsDate()
  updatedAt!: Date;

  @Expose({ name: "updated_by" })
  @IsUUID()
  updatedBy!: string | null;
}

export class NewTeacherUser {
  @Expose({ name: "user_id" })
  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @Expose({ name: "teacher_id" })
  @IsNotEmpty()
  @IsUUID()
  teacherId!: string;
}

export class TeacherUser extends NewTeacherUser {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

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
