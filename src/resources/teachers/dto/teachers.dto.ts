import { Expose } from "class-transformer";
import { Identifier } from "entities/common";
import { instanceToPlain, plainToInstance } from "utils/transformer";
import { IsEmail, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { TeacherDatum, TeacherEntity } from "entities/teacher.entities";

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

export class UpdateTeacherDto {
  @Expose({ name: "staff_id" })
  @IsString()
  @IsNotEmpty()
  staffId!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class CreateTeacherDto extends UpdateTeacherDto {
  @Expose()
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class TeacherDto extends CreateTeacherDto {
  @Expose()
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  id!: string;
}
