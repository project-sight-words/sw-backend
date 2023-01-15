import { CreateStamp, DeleteStamp, Identifier, UpdateStamp } from "./common";
import { Expose, Type } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty, IsUUID } from "class-validator";
import { plainToInstance } from "utils/transformer";

export class ClassDatum {
  @Expose({ name: "day_time" })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  dayTime!: Date;

  @Expose({ name: "centre_id" })
  @IsNotEmpty()
  @IsUUID()
  centreId!: string;

  static fromObject(object: object): ClassDatum {
    const datum = plainToInstance(ClassDatum, object);
    return datum;
  }
}

export class ClassEntity {
  identifier!: Identifier;
  datum!: ClassDatum;
  createStamp!: CreateStamp;
  updateStamp!: UpdateStamp;
  deleteStamp!: DeleteStamp;

  static fromObject(object: object): ClassEntity {
    const entity = new ClassEntity();
    entity.identifier = Identifier.fromObject(object);
    entity.datum = ClassDatum.fromObject(object);
    entity.createStamp = CreateStamp.fromObject(object);
    entity.updateStamp = UpdateStamp.fromObject(object);
    entity.deleteStamp = DeleteStamp.fromObject(object);
    return entity;
  }
}

export class ClassCentreDatum {
  @Expose({ name: "centre_id" })
  @IsNotEmpty()
  @IsUUID()
  classId!: string;

  @Expose({ name: "centre_id" })
  @IsNotEmpty()
  @IsUUID()
  centreId!: string;

  static fromObject(object: object): ClassCentreDatum {
    const datum = plainToInstance(ClassCentreDatum, object);
    return datum;
  }
}

export class ClassCentreEntity {
  identifier!: Identifier;
  datum!: ClassCentreDatum;
  createStamp!: CreateStamp;
  deleteStamp!: DeleteStamp;

  static fromObject(object: object): ClassCentreEntity {
    const entity = new ClassCentreEntity();
    entity.identifier = Identifier.fromObject(object);
    entity.datum = ClassCentreDatum.fromObject(object);
    entity.createStamp = CreateStamp.fromObject(object);
    entity.deleteStamp = DeleteStamp.fromObject(object);
    return entity;
  }
}

export class ClassTeacherDatum {
  @Expose({ name: "class_id" })
  @IsNotEmpty()
  @IsUUID()
  classId!: string;

  @Expose({ name: "teacher_id" })
  @IsNotEmpty()
  @IsUUID()
  teacherId!: string;

  @Expose({ name: "is_form_teacher" })
  @IsBoolean()
  isFormTeacher!: boolean;

  static fromObject(object: object): ClassTeacherDatum {
    const datum = plainToInstance(ClassTeacherDatum, object);
    return datum;
  }
}

export class ClassTeacherEntity {
  identifier!: Identifier;
  datum!: ClassTeacherDatum;
  createStamp!: CreateStamp;
  deleteStamp!: DeleteStamp;

  static fromObject(object: object): ClassTeacherEntity {
    const entity = new ClassTeacherEntity();
    entity.identifier = Identifier.fromObject(object);
    entity.datum = ClassTeacherDatum.fromObject(object);
    entity.createStamp = CreateStamp.fromObject(object);
    entity.deleteStamp = DeleteStamp.fromObject(object);
    return entity;
  }
}

export class ClassStudentDatum {
  @Expose({ name: "class_id" })
  @IsNotEmpty()
  @IsUUID()
  classId!: string;

  @Expose({ name: "student_id" })
  @IsNotEmpty()
  @IsUUID()
  studentId!: string;

  static fromObject(object: object): ClassStudentDatum {
    const datum = plainToInstance(ClassStudentDatum, object);
    return datum;
  }
}

export class ClassStudentEntity {
  identifier!: Identifier;
  datum!: ClassStudentDatum;
  createStamp!: CreateStamp;
  deleteStamp!: DeleteStamp;

  static fromObject(object: object): ClassStudentEntity {
    const entity = new ClassStudentEntity();
    entity.identifier = Identifier.fromObject(object);
    entity.datum = ClassStudentDatum.fromObject(object);
    entity.createStamp = CreateStamp.fromObject(object);
    entity.deleteStamp = DeleteStamp.fromObject(object);
    return entity;
  }
}
