import { CreateStamp, DeleteStamp, Identifier, UpdateStamp } from "./common";
import { Expose } from "class-transformer";
import { instanceToPlain, plainToInstance } from "utils/transformer";
import { IsDate, IsEmail, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class TeacherDatum {
  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Expose({ name: "staff_id" })
  @IsNotEmpty()
  @IsString()
  staffId!: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  name!: string;

  static fromObject(object: object): TeacherDatum {
    const datum = plainToInstance(TeacherDatum, object);
    return datum;
  }

  static toObject(datum: TeacherDatum): object {
    const object = instanceToPlain(datum);
    return object;
  }
}

export class TeacherEntity {
  identifier!: Identifier;
  datum!: TeacherDatum;
  createStamp!: CreateStamp;
  updateStamp!: UpdateStamp;
  deleteStamp!: DeleteStamp;

  static fromObject(object: object): TeacherEntity {
    const entity = new TeacherEntity();
    entity.identifier = Identifier.fromObject(object);
    entity.datum = TeacherDatum.fromObject(object);
    entity.createStamp = CreateStamp.fromObject(object);
    entity.updateStamp = UpdateStamp.fromObject(object);
    entity.deleteStamp = DeleteStamp.fromObject(object);
    return entity;
  }

  static toObject(entity: TeacherEntity): object {
    const { identifier, datum, createStamp, updateStamp, deleteStamp } = entity;
    return {
      ...Identifier.toObject(identifier),
      ...TeacherDatum.toObject(datum),
      ...CreateStamp.toObject(createStamp),
      ...UpdateStamp.toObject(updateStamp),
      ...DeleteStamp.toObject(deleteStamp),
    };
  }
}

export class UpdateTeacher {
  @Expose({ name: "staff_id" })
  @IsNotEmpty()
  @IsString()
  staffId!: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  name!: string;
}

export class NewTeacher extends UpdateTeacher {
  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}

export class Teacher {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @Expose()
  @IsEmail()
  email!: string | null;

  @Expose({ name: "staff_id" })
  @IsNotEmpty()
  @IsString()
  staffId!: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Expose({ name: "updated_at" })
  @IsNotEmpty()
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
  @IsNotEmpty()
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
