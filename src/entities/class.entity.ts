import { Expose, plainToClass } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty, IsUUID } from "class-validator";
import { Centre } from "./centre.entity";
import { CreateStamp, DeleteStamp, Identifier, UpdateStamp } from "./common";

export class Class {
  @Expose({ name: "day_time" })
  @IsNotEmpty()
  @IsDate()
  dayTime!: Date;
}

export class ClassEntity {
  identifier!: Identifier;
  class!: Class;
  centre!: Centre;
  createStamp!: CreateStamp;
  updateStamp!: UpdateStamp;
  deleteStamp!: DeleteStamp;

  static fromObject(object: object): ClassEntity {
    const classEntity = new ClassEntity();
    classEntity.identifier = plainToClass(Identifier, object);
    classEntity.class = plainToClass(Class, object);
    classEntity.centre = plainToClass(Centre, object);
    classEntity.createStamp = plainToClass(CreateStamp, object);
    classEntity.updateStamp = plainToClass(UpdateStamp, object);
    classEntity.deleteStamp = plainToClass(DeleteStamp, object);
    return classEntity;
  }
}

export class ClassTeacher {
  @IsNotEmpty()
  @IsUUID()
  @Expose({ name: "teacher_id" })
  teacherId!: string;

  @IsNotEmpty()
  @IsUUID()
  @Expose({ name: "class_id" })
  classId!: string;

  @IsNotEmpty()
  @IsBoolean()
  @Expose({ name: "is_form_teacher" })
  isFormTeacher!: boolean;

  @IsNotEmpty()
  @Expose({ name: "created_at" })
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

export class ClassStudent {
  @IsNotEmpty()
  @IsUUID()
  @Expose({ name: "student_id" })
  studentId!: string;

  @IsNotEmpty()
  @IsUUID()
  @Expose({ name: "class_id" })
  classId!: string;

  @IsNotEmpty()
  @Expose({ name: "created_at" })
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
