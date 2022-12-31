import { Centre, CentreEntity } from "entities/centre.entity";
import { Expose, plainToClass } from "class-transformer";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

// TODO: export class AddClassToCentreDto {
//   @IsUUID()
//   @IsNotEmpty()
//   @Expose({ name: "class_id" })
//   classId!: string;
// }

export class CentreDto {
  @IsNotEmpty()
  @Expose()
  @IsString()
  name!: string;

  static toCentre(dto: CentreDto): Centre {
    const { name } = dto;
    const centre = plainToClass(Centre, { name });
    return centre;
  }
}

export class IdentifiableCentreDto extends CentreDto {
  @IsNotEmpty()
  @Expose()
  @IsUUID()
  id!: string;

  static fromEntity(entity: CentreEntity): IdentifiableCentreDto {
    const { id } = entity.identifier;
    const { name } = entity.centre;
    const dto = plainToClass(IdentifiableCentreDto, { id, name });
    return dto;
  }
}
