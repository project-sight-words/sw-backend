import { Exclude, Expose, Type } from "class-transformer";
import { Identifier } from "entities/common";
import { instanceToPlain, plainToInstance } from "utils/transformer";
import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import {
  StudentDatum,
  StudentEntity,
  StudentUser,
} from "entities/student.entities";
import { ClassWithCentreDto } from "resources/classes/dto/classes.dto";

export class StudentDatumDto extends StudentDatum {
  static fromObject(object: object): StudentDatumDto {
    const datumDto = plainToInstance(StudentDatumDto, object);
    return datumDto;
  }

  static toObject(dto: StudentDatumDto): object {
    const plain = instanceToPlain(dto);
    return plain;
  }

  static fromStudentDatum(datum: StudentDatum): StudentDatumDto {
    const plain = StudentDatum.toObject(datum);
    const dto = StudentDatumDto.fromObject(plain);
    return dto;
  }

  static toStudentDatum(dto: StudentDatumDto): StudentDatum {
    const plain = StudentDatumDto.toObject(dto);
    const datum = StudentDatum.fromObject(plain);
    return datum;
  }
}

export class StudentEntityDto extends StudentDatumDto {
  @IsNotEmpty()
  @Expose({ name: "id" })
  @IsUUID()
  id!: string;

  static toObject(dto: StudentEntityDto): object {
    const plain = instanceToPlain(dto);
    return plain;
  }

  static fromStudentEntity(entity: StudentEntity): StudentEntityDto {
    const { identifier, datum } = entity;
    const datumDto = StudentDatumDto.fromStudentDatum(datum);
    const dto = plainToInstance(StudentEntityDto, {
      ...Identifier.toObject(identifier),
      ...StudentDatumDto.toObject(datumDto),
    });
    return dto;
  }
}

// TODO: Refactor the below
export class UpdateStudentDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Expose({ name: "student_id" })
  @IsNotEmpty()
  @IsString()
  studentId!: string;

  @Expose()
  comments!: string;
}

export class CreateStudentDto extends UpdateStudentDto {
  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}

@Exclude()
export class StudentDto extends CreateStudentDto {
  @Expose({ name: "id" })
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  static from(studentUser: StudentUser): StudentDto {
    return {
      id: studentUser.studentId,
      email: studentUser.user.email,
      name: studentUser.student.name,
      studentId: studentUser.student.studentId,
      comments: studentUser.student.comments ?? "",
    };
  }

  static fromMany(studentUsers: StudentUser[]): StudentDto[] {
    return studentUsers.map((studentUser) => StudentDto.from(studentUser));
  }
}

export class CreateStudentErrorDto {
  @Expose()
  @IsInt()
  index!: number;

  @Expose()
  @IsString()
  @IsNotEmpty()
  message!: string;
}

export class DetailedStudentDto extends StudentDto {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassWithCentreDto)
  classes!: ClassWithCentreDto[];

  static from(studentUser: StudentUser): DetailedStudentDto {
    const classStudents = studentUser.student.classStudents;
    let classes: ClassWithCentreDto[] = [];
    if (!!classStudents) {
      classes = ClassWithCentreDto.fromClasses(
        classStudents
          .filter((cs) => !!cs && !cs.deletedAt)
          .map((cs) => cs.class),
      );
    }
    return {
      ...StudentDto.from(studentUser),
      classes: classes,
    };
  }

  static fromMany(studentUsers: StudentUser[]): DetailedStudentDto[] {
    return studentUsers.map((su) => DetailedStudentDto.from(su));
  }
}
