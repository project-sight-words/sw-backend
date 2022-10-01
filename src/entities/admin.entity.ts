import { Expose } from "class-transformer";
import { IsDate, IsNotEmpty, IsUUID } from "class-validator";
import { User } from "./user.entities";

export class Admin {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  id!: string;
}
export class AdminUser extends User {
  @Expose({ name: "user_id" })
  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @Expose({ name: "admin_id" })
  @IsNotEmpty()
  @IsUUID()
  adminId!: string;

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
