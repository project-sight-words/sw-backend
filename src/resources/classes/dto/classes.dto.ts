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
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { TeacherEntityDto } from "resources/teachers/dto/teachers.dto";
import { IsTimeWithTimezone } from "utils/validator";
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

  // Defaults to isActive = true
  @Expose()
  @IsBoolean()
  @IsOptional()
  isActive = true;

  static fromObject(object: object): ClassEntityDto {
    const datum = plainToInstance(ClassEntityDto, object);
    return datum;
  }

  static toObject(datum: ClassEntityDto): object {
    const plain = instanceToPlain(datum);
    return plain;
  }
}

export class ClassWithCentreDto extends ClassEntityDto {
  @Expose()
  @IsInstance(CentreEntityDto)
  centre?: CentreEntityDto;

  // TODO Properly handle null cases
  static fromClass(classEntity: Class): ClassWithCentreDto | null {
    if (!classEntity) return null;
    let centre = undefined;
    if (!!classEntity && !!classEntity.classCentre)
      centre = plainToInstance(CentreEntityDto, classEntity.classCentre.centre);
    return {
      ...classEntity,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      centre: centre,
    };
  }

  static fromClasses(classEntities: Class[]): ClassWithCentreDto[] {
    const entities: ClassWithCentreDto[] = [];
    for (const entity of classEntities.map((classEntity) =>
      this.fromClass(classEntity),
    )) {
      if (!!entity) entities.push(entity);
    }

    return entities;
  }
}

export class DetailedClassDto extends ClassWithCentreDto {
  static readonly loggerService = new Logger("DetailedClassDto");

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
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      detailedClass.classCentre?.centre,
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
