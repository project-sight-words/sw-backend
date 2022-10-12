import { Exclude, Expose, Type } from "class-transformer";
import { IsDate, IsEmail, IsNotEmpty, IsUUID } from "class-validator";

export class NewStudent {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Expose({ name: "student_id" })
  @IsNotEmpty()
  studentId!: string;

  @IsNotEmpty()
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
  updatedAt!: Date | null;

  @Type(() => UserStudent)
  userStudent!: UserStudent | null;
}

export class NewUserStudent {
  @Expose({ name: "user_id" })
  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @Expose({ name: "student_id" })
  @IsNotEmpty()
  @IsUUID()
  studentId!: string;
}

export class UserStudent {
  @Expose({ name: "created_by" })
  @IsUUID()
  createdBy!: string | null;

  @Expose({ name: "created_at" })
  @IsDate()
  createdAt!: Date | null;
}
