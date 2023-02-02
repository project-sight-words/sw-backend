import { CentreEntity } from "entities/centre.entity";
import { CentreEntityDto } from "resources/centres/dto/centres.dto";
import { Expose, Type } from "class-transformer";
import { getOrError } from "utils/map";
import { Identifier } from "entities/common";
import { instanceToPlain, plainToInstance } from "utils/transformer";
import { Logger } from "@nestjs/common";
import { StudentEntity } from "entities/student.entities";
import { StudentEntityDto } from "resources/students/dto/students.dto";
import {
  IsArray,
  IsBoolean,
  IsInstance,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from "class-validator";
import {
  ClassDatum,
  ClassEntity,
  ClassStudentDatum,
  ClassTeacherDatum,
} from "entities/class.entity";

export class ClassDatumDto extends ClassDatum {
  static fromObject(object: object): ClassDatumDto {
    const datumDto = plainToInstance(ClassDatumDto, object);
    return datumDto;
  }

  static toObject(dto: ClassDatumDto): object {
    const plain = instanceToPlain(dto);
    return plain;
  }

  static toClassDatum(dto: ClassDatumDto): ClassDatum {
    const plain = ClassDatumDto.toObject(dto);
    const datum = ClassDatum.fromObject(plain);
    return datum;
  }

  static fromClassDatum(datum: ClassDatum): ClassDatumDto {
    const plain = ClassDatum.toObject(datum);
    const dto = ClassDatumDto.fromObject(plain);
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
      ...Identifier.toObject(identifier),
      ...ClassDatumDto.toObject(datumDto),
    });
    return dto;
  }
}

export class DetailedClassDto extends ClassEntityDto {
  static readonly loggerService = new Logger("DetailedClassDto");

  @Expose()
  @IsInstance(CentreEntityDto)
  centre!: CentreEntityDto;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentEntityDto)
  students!: StudentEntityDto[];

  static fromClassEntityAndDetails(
    classEntity: ClassEntity,
    centreEntityMap: Map<string, CentreEntity>,
    studentEntitiesMap: Map<string, StudentEntity[]>,
  ): DetailedClassDto {
    const classEntityDto = ClassEntityDto.fromClassEntity(classEntity);
    const {
      identifier: { id: classId },
      datum: classDatum,
    } = classEntity;
    const { centreId } = classDatum;
    const centreEntity = getOrError(
      centreEntityMap,
      centreId,
      DetailedClassDto.loggerService,
    );
    const centreEntityDto = CentreEntityDto.fromCentreEntity(centreEntity);
    const studentEntities = studentEntitiesMap.get(classId) ?? [];
    const dto = plainToInstance(DetailedClassDto, {
      ...ClassEntityDto.toObject(classEntityDto),
      centre: CentreEntityDto.toObject(centreEntityDto),
      students: studentEntities.map((entity) => {
        const studentEntityDto = StudentEntityDto.fromStudentEntity(entity);
        const plain = StudentEntityDto.toObject(studentEntityDto);
        return plain;
      }),
    });
    return dto;
  }

  static fromClassEntitiesAndDetails(
    classEntities: ClassEntity[],
    centreEntityMap: Map<string, CentreEntity>,
    studentEntitiesMap: Map<string, StudentEntity[]>,
  ): DetailedClassDto[] {
    const dtos = classEntities.map((entity) =>
      this.fromClassEntityAndDetails(
        entity,
        centreEntityMap,
        studentEntitiesMap,
      ),
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

  static toObject(dto: ClassTeacherDto): object {
    const plain = instanceToPlain(dto);
    return plain;
  }

  static toClassTeacherDatum(
    dto: ClassTeacherDto,
    classId: string,
  ): ClassTeacherDatum {
    const datum = ClassTeacherDatum.fromObject({
      ...ClassTeacherDto.toObject(dto),
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

  static toObject(dto: ClassStudentDto): object {
    const plain = instanceToPlain(dto);
    return plain;
  }

  static toClassStudentDatum(
    dto: ClassStudentDto,
    classId: string,
  ): ClassStudentDatum {
    const datum = ClassStudentDatum.fromObject({
      ...ClassStudentDto.toObject(dto),
      class_id: classId,
    });
    return datum;
  }
}
