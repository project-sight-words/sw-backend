import { Expose } from "class-transformer";
import { IsDate, IsNotEmpty, IsUUID } from "class-validator";

export class Identifier {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  id!: string;
}

export class CreateStamp {
  @Expose({ name: "created_by" })
  @IsUUID()
  createdBy!: string | null;

  @Expose({ name: "created_at" })
  @IsDate()
  createdAt!: Date;
}

export class DeleteStamp {
  @Expose({ name: "deleted_by" })
  @IsUUID()
  deletedBy!: string;

  @Expose({ name: "deleted_at" })
  @IsDate()
  deletedAt!: Date | null;
}

export class UpdateStamp {
  @Expose({ name: "updated_by" })
  @IsUUID()
  updatedBy!: string | null;

  @Expose({ name: "updated_at" })
  @IsDate()
  updatedAt!: Date | null;
}
