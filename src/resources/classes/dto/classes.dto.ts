import { OmitType, PickType } from "@nestjs/mapped-types";
import { Class } from "entities/class.entities";
import { CentreEntityDto } from "resources/centres/dto/centres.dto";
import { Expose, Type } from "class-transformer";
import { Logger } from "@nestjs/common";
import { StudentEntityDto } from "resources/students/dto/students.dto";
import {
  IsArray,
  IsBoolean,
  IsInstance,
  IsInt,
  IsNotEmpty,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { TeacherEntityDto } from "resources/teachers/dto/teachers.dto";
import { IsTimeWithTimezone } from "utils/validator";
import { Centre } from "entities/centre.entities";
import { instanceToPlain, plainToInstance } from "utils/transformer";

export class ClassEntityDto {
  // Need to expose timestampz/userstampz?
  @Expose()
  @IsUUID()
  id?: string;

  @Expose()
  @IsInt()
  @Min(0)
  @Max(6)
  @IsNotEmpty()
  startDay?: number;

  @Expose()
  @IsTimeWithTimezone()
  startTime?: string;

  @Expose()
  @Min(0)
  @Max(6)
  @IsNotEmpty()
  endDay?: number;

  @Expose()
  @IsTimeWithTimezone()
  endTime?: string;

  static fromObject(object: object): ClassEntityDto {
    const datum = plainToInstance(ClassEntityDto, object);
    return datum;
  }

  static toObject(datum: ClassEntityDto): object {
    const plain = instanceToPlain(datum);
    return plain;
  }
}

export class DetailedClassDto extends ClassEntityDto {
  static readonly loggerService = new Logger("DetailedClassDto");

  @Expose()
  @IsInstance(Centre)
  centre?: CentreEntityDto;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentEntityDto)
  students?: StudentEntityDto[];

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeacherEntityDto)
  teachers?: TeacherEntityDto[];

  static fromDetailedClassEntity(detailedClass: Class) {
    const students = detailedClass.classStudents.map((classStudent) =>
      plainToInstance(StudentEntityDto, classStudent.student),
    );

    const teachers = detailedClass.classTeachers.map((classTeacher) =>
      plainToInstance(TeacherEntityDto, classTeacher.teacher),
    );

    const centre = plainToInstance(
      CentreEntityDto,
      detailedClass.classCentre.centre,
    );

    const detailedClassDto = {
      students: students,
      teachers: teachers,
      centre: centre,
      ...detailedClass,
    };

    return plainToInstance(DetailedClassDto, detailedClassDto);
  }

  static fromDetailedClassEntities(detailedClassEntites: Class[]) {
    const detailedClasses = detailedClassEntites.map((detailedClassEntity) =>
      this.fromDetailedClassEntity(detailedClassEntity),
    );
    return detailedClasses;
  }

  static toObject(detailedClassDto: DetailedClassDto) {
    const plain = instanceToPlain(detailedClassDto);
    return plain;
  }
}

export class ClassTeacherDatum {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  teacherId!: string;

  @Expose()
  @IsBoolean()
  isFormTeacher!: boolean;

  static toObject(dto: ClassTeacherDatum): object {
    const plain = instanceToPlain(dto);
    return plain;
  }
}

export class ClassStudentDatum {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  studentId!: string;

  static toObject(dto: ClassStudentDatum): object {
    const plain = instanceToPlain(dto);
    return plain;
  }
}

export class ClassCentreDto {
  // Check if need to add extra fields
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  centreId!: string;
}

export class ClassDatum extends OmitType(ClassEntityDto, ["id"] as const) {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  centreId!: string;
}

export class CreateClassDto extends ClassDatum {}

export class UpdateClassDto extends CreateClassDto {}

export class CreateClassStudentDto extends ClassStudentDatum {}

export class CreateClassTeacherDto extends ClassTeacherDatum {}

export class CreateClassCentreDto extends PickType(ClassCentreDto, [
  "centreId",
]) {}
