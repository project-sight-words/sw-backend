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
  @Exclude({ toPlainOnly: true })
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @Expose({ name: "updated_by" })
  @Exclude({ toPlainOnly: true })
  @IsUUID()
  updatedBy!: string | null;

  @Expose({ name: "updated_at" })
  @Exclude({ toPlainOnly: true })
  @IsDate()
  updatedAt!: Date | null;

  @Exclude({ toPlainOnly: true })
  @Type(() => UserStudent)
  userStudent!: UserStudent | null;
}

export class UserStudent {
  @Expose({ name: "created_by" })
  @Exclude({ toPlainOnly: true })
  @IsUUID()
  createdBy!: string | null;

  @Expose({ name: "created_at" })
  @Exclude({ toPlainOnly: true })
  @IsDate()
  createdAt!: Date | null;
}
