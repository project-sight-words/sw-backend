import { CreateStamp, DeleteStamp, Identifier, UpdateStamp } from "./common";
import { Expose } from "class-transformer";
import { instanceToPlain, plainToInstance } from "utils/transformer";
import { IsDate, IsEmail, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class StudentDatum {
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

  static fromObject(object: object): StudentDatum {
    const datum = plainToInstance(StudentDatum, object);
    return datum;
  }

  static toObject(datum: StudentDatum): object {
    const object = instanceToPlain(datum);
    return object;
  }
}

export class StudentEntity {
  identifier!: Identifier;
  datum!: StudentDatum;
  createStamp!: CreateStamp;
  updateStamp!: UpdateStamp;
  deleteStamp!: DeleteStamp;

  static fromObject(object: object): StudentEntity {
    const entity = new StudentEntity();
    entity.identifier = Identifier.fromObject(object);
    entity.datum = StudentDatum.fromObject(object);
    entity.createStamp = CreateStamp.fromObject(object);
    entity.updateStamp = UpdateStamp.fromObject(object);
    entity.deleteStamp = DeleteStamp.fromObject(object);
    return entity;
  }

  static toObject(entity: StudentEntity): object {
    const { identifier, datum, createStamp, updateStamp, deleteStamp } = entity;
    return {
      ...Identifier.toObject(identifier),
      ...StudentDatum.toObject(datum),
      ...CreateStamp.toObject(createStamp),
      ...UpdateStamp.toObject(updateStamp),
      ...DeleteStamp.toObject(deleteStamp),
    };
  }
}

// TODO: Adjust this to datum-entity relationship
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

// TODO: Adjust this to datum-entity relationship
export class StudentUser {
  @Expose({ name: "created_by" })
  @IsUUID()
  createdBy!: string | null;

  @Expose({ name: "created_at" })
  @IsDate()
  createdAt!: Date;
}
