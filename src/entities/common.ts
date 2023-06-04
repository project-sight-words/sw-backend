import { Expose, plainToClass } from "class-transformer";
import { IsDate, IsNotEmpty, IsUUID } from "class-validator";
import { instanceToPlain, plainToInstance } from "utils/transformer";

export class Identifier {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  static fromObject(object: object): Identifier {
    const identifier = plainToInstance(Identifier, object);
    return identifier;
  }

  static toObject(identifier: Identifier): object {
    const object = instanceToPlain(identifier);
    return object;
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
    const createStamp = plainToInstance(CreateStamp, object);
    return createStamp;
  }

  static toObject(createStamp: CreateStamp): object {
    const object = instanceToPlain(createStamp);
    return object;
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

  static toObject(deleteStamp: DeleteStamp): object {
    const object = instanceToPlain(deleteStamp);
    return object;
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

  static toObject(updateStamp: UpdateStamp): object {
    const object = instanceToPlain(updateStamp);
    return object;
  }
}
