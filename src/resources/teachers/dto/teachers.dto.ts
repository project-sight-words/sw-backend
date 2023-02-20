import { Expose } from "class-transformer";
import { IsNotEmpty, IsUUID } from "class-validator";
import { Identifier } from "entities/common";
import {
  TeacherDatum,
  TeacherEntity,
  TeacherUser,
} from "entities/teacher.entities";
import { instanceToPlain, plainToInstance } from "utils/transformer";

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
