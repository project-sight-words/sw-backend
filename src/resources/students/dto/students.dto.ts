import { Exclude, Expose } from "class-transformer";
import { Identifier } from "entities/common";
import { instanceToPlain, plainToInstance } from "utils/transformer";
import { IsEmail, IsInt, IsNotEmpty, IsString, IsUUID } from "class-validator";
import {
  StudentDatum,
  StudentEntity,
  StudentUser,
} from "entities/student.entities";

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
