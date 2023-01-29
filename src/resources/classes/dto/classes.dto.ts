import { CentreEntity } from "entities/centre.entity";
import { CentreEntityDto } from "resources/centres/dto/centres.dto";
import { Expose, plainToClass, Type } from "class-transformer";
import { getOrError } from "utils/map";
import { instanceToPlain, plainToInstance } from "utils/transformer";
import {
  ClassDatum,
  ClassEntity,
  ClassStudentDatum,
  ClassTeacherDatum,
} from "entities/class.entity";
import {
  IsBoolean,
  IsDate,
  IsInstance,
  IsNotEmpty,
  IsUUID,
} from "class-validator";

export class ClassDatumDto {
  @Expose({ name: "day_time" })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  dayTime!: Date;

  @Expose({ name: "centre_id" })
  @IsNotEmpty()
  @IsUUID()
  centreId!: string;

  static toClassDatum(dto: ClassDatumDto): ClassDatum {
    const plain = instanceToPlain(dto);
    const datum = plainToClass(ClassDatum, plain);
    return datum;
  }

  static fromClassDatum(datum: ClassDatum): ClassDatumDto {
    const plain = instanceToPlain(datum);
    const dto = plainToClass(ClassDatum, plain);
    return dto;
  }
}

export class ClassEntityDto extends ClassDatumDto {
  @IsNotEmpty()
  @Expose()
  @IsUUID()
  id!: string;

  static fromClassEntity(entity: ClassEntity): ClassEntityDto {
    const { identifier, datum } = entity;
    const datumDto = ClassDatumDto.fromClassDatum(datum);
    const dto = plainToInstance(ClassEntityDto, {
      ...instanceToPlain(identifier),
      ...instanceToPlain(datumDto),
    });
    return dto;
  }
}

export class DetailedClassDto extends ClassEntityDto {
  @Expose()
  @IsInstance(CentreEntityDto)
  centre!: CentreEntityDto;

  static fromClassEntityAndDetails(
    classEntity: ClassEntity,
    centreEntityMap: Map<string, CentreEntity>,
  ): DetailedClassDto {
    const classEntityDto = ClassEntityDto.fromClassEntity(classEntity);
    const { datum: classDatum } = classEntity;
    const { centreId } = classDatum;
    const centreEntity = getOrError(centreEntityMap, centreId);
    const centreEntityDto = CentreEntityDto.fromCentreEntity(centreEntity);
    const dto = plainToInstance(DetailedClassDto, {
      ...instanceToPlain(classEntityDto),
      centre: instanceToPlain(centreEntityDto),
    });
    return dto;
  }

  static fromClassEntitiesAndDetails(
    classEntities: ClassEntity[],
    centreEntityMap: Map<string, CentreEntity>,
  ): DetailedClassDto[] {
    const dtos = classEntities.map((entity) =>
      this.fromClassEntityAndDetails(entity, centreEntityMap),
    );
    return dtos;
  }
}

export class ClassTeacherDto {
  @Expose({ name: "teacher_id" })
  @IsNotEmpty()
  @IsUUID()
  teacherId!: string;

  @Expose({ name: "is_form_teacher" })
  @IsBoolean()
  isFormTeacher!: boolean;

  static toClassTeacherDatum(
    dto: ClassTeacherDto,
    classId: string,
  ): ClassTeacherDatum {
    const plain = instanceToPlain(dto);
    const datum = plainToClass(ClassTeacherDatum, {
      ...plain,
      class_id: classId,
    });
    return datum;
  }
}

export class ClassStudentDto {
  @Expose({ name: "student_id" })
  @IsNotEmpty()
  @IsUUID()
  studentId!: string;

  static toClassStudentDatum(
    dto: ClassStudentDto,
    classId: string,
  ): ClassStudentDatum {
    const plain = instanceToPlain(dto);
    const datum = plainToClass(ClassStudentDatum, {
      ...plain,
      class_id: classId,
    });
    return datum;
  }
}
