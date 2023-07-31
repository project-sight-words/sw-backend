import { ClassWithCentreDto } from "resources/classes/dto/classes.dto";
import { Expose, Type } from "class-transformer";
import { Identifier } from "entities/common";
import { instanceToPlain, plainToInstance } from "utils/transformer";
import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import {
  TeacherDatum,
  TeacherEntity,
  TeacherUser,
} from "entities/teacher.entities";

export class UpdateTeacherDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Expose({ name: "staff_id" })
  @IsNotEmpty()
  @IsString()
  staffId!: string;
}

export class CreateTeacherDto extends TeacherDatum {}

export class TeacherDto extends TeacherDatum {
  @Expose()
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  static fromTeacherUser(teacherUser: TeacherUser): TeacherDto {
    return {
      id: teacherUser.teacherId,
      email: teacherUser.user.email,
      name: teacherUser.teacher.name,
      staffId: teacherUser.teacher.staffId,
    };
  }

  static fromTeacherUsers(teacherUsers: TeacherUser[]): TeacherDto[] {
    return teacherUsers.map((teacherUser) =>
      TeacherDto.fromTeacherUser(teacherUser),
    );
  }
}

export class DetailedTeacherDto extends TeacherDto {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassWithCentreDto)
  classes!: ClassWithCentreDto[];

  static fromTeacherUser(teacherUser: TeacherUser): DetailedTeacherDto {
    return {
      ...TeacherDto.fromTeacherUser(teacherUser),
      classes: ClassWithCentreDto.fromClasses(
        teacherUser.teacher.classTeachers
          .filter((ct) => !!ct && !ct.deletedAt)
          .map((ct) => ct.class),
      ),
    };
  }

  static fromTeacherUsers(teacherUsers: TeacherUser[]): DetailedTeacherDto[] {
    return teacherUsers.map((teacherUser) =>
      DetailedTeacherDto.fromTeacherUser(teacherUser),
    );
  }
}

// TODO: Remove if not used
export class TeacherDatumDto extends TeacherDatum {
  static fromObject(object: object): TeacherDatumDto {
    const datumDto = plainToInstance(TeacherDatumDto, object);
    return datumDto;
  }

  static toObject(dto: TeacherDatumDto): object {
    const plain = instanceToPlain(dto);
    return plain;
  }

  static fromStudentDatum(datum: TeacherDatum): TeacherDatumDto {
    const plain = TeacherDatum.toObject(datum);
    const dto = TeacherDatumDto.fromObject(plain);
    return dto;
  }

  static toStudentDatum(dto: TeacherDatumDto): TeacherDatumDto {
    const plain = TeacherDatumDto.toObject(dto);
    const datum = TeacherDatum.fromObject(plain);
    return datum;
  }
}

export class TeacherEntityDto extends TeacherDatumDto {
  @Expose({ name: "id" })
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  static toObject(dto: TeacherEntityDto): object {
    const plain = instanceToPlain(dto);
    return plain;
  }

  static fromTeacherEntity(entity: TeacherEntity): TeacherEntityDto {
    const { identifier, datum } = entity;
    const datumDto = TeacherDatumDto.fromStudentDatum(datum);
    const dto = plainToInstance(TeacherEntityDto, {
      ...Identifier.toObject(identifier),
      ...TeacherDatumDto.toObject(datumDto),
    });
    return dto;
  }
}
