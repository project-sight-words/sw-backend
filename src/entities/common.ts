import { Expose, plainToClass } from "class-transformer";
import { IsDate, IsNotEmpty, IsUUID } from "class-validator";

export class Identifier {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  static fromObject(object: object): Identifier {
    const identifier = plainToClass(Identifier, object, {
      excludeExtraneousValues: true,
    });
    return identifier;
  }
}

export class CreateStamp {
  @Expose({ name: "created_by" })
  @IsUUID()
  createdBy!: string | null;

  @Expose({ name: "created_at" })
  @IsDate()
  createdAt!: Date;

  static fromObject(object: object): CreateStamp {
    const createStamp = plainToClass(CreateStamp, object, {
      excludeExtraneousValues: true,
    });
    return createStamp;
  }
}

export class DeleteStamp {
  @Expose({ name: "deleted_by" })
  @IsUUID()
  deletedBy!: string;

  @Expose({ name: "deleted_at" })
  @IsDate()
  deletedAt!: Date | null;

  static fromObject(object: object): DeleteStamp {
    const deleteStamp = plainToClass(DeleteStamp, object, {
      excludeExtraneousValues: true,
    });
    return deleteStamp;
  }
}

export class UpdateStamp {
  @Expose({ name: "updated_by" })
  @IsUUID()
  updatedBy!: string | null;

  @Expose({ name: "updated_at" })
  @IsDate()
  updatedAt!: Date;

  static fromObject(object: object): UpdateStamp {
    const deleteStamp = plainToClass(UpdateStamp, object, {
      excludeExtraneousValues: true,
    });
    return deleteStamp;
  }
}
