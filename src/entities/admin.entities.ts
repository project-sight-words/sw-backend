import { Expose } from "class-transformer";
import { IsDate, IsEmail, IsNotEmpty, IsUUID } from "class-validator";

export class NewAdmin {
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}

export class Admin {
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsEmail()
  email!: string | null;
}

export class NewAdminUser {
  @Expose({ name: "user_id" })
  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @Expose({ name: "admin_id" })
  @IsNotEmpty()
  @IsUUID()
  adminId!: string;
}

export class AdminUser {
  @Expose({ name: "created_by" })
  @IsUUID()
  createdBy!: string | null;

  @Expose({ name: "created_at" })
  @IsDate()
  createdAt!: Date;

  @Expose({ name: "deleted_by" })
  @IsUUID()
  deletedBy!: string | null;

  @Expose({ name: "deleted_at" })
  @IsDate()
  deletedAt!: Date | null;
}
