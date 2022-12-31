import { Centre } from "entities/centre.entity";
import { Expose, plainToClass } from "class-transformer";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class AddClassToCentreDto {
  @IsUUID()
  @IsNotEmpty()
  @Expose({ name: "class_id" })
  classId!: string;
}

export class CentreDto {
  @IsNotEmpty()
  @Expose()
  @IsUUID()
  id!: string;

  @IsNotEmpty()
  @Expose()
  @IsString()
  name!: string;

  static fromEntity(entity: Centre): CentreDto {
    const { id, name } = entity;
    const dto = plainToClass(CentreDto, { id, name });
    return dto;
  }
}
