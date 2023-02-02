import { CreateStamp, DeleteStamp, Identifier, UpdateStamp } from "./common";
import { Expose } from "class-transformer";
import { instanceToPlain, plainToInstance } from "utils/transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class StudentDatum {
  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Expose({ name: "student_id" })
  @IsNotEmpty()
  @IsString()
  studentId!: string;

  @Expose()
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
