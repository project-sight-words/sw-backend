import { PickType } from "@nestjs/mapped-types";
import { Expose, Type } from "class-transformer";
import { IsArray, IsString, IsUUID, ValidateNested } from "class-validator";
import { ClassEntityDto } from "resources/classes/dto/classes.dto";
import { Centre } from "entities/centre.entities";

export class CentreEntityDto {
  @Expose()
  @IsUUID()
  id!: string;

  @Expose()
  @IsString()
  name!: string;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassEntityDto)
  classes?: ClassEntityDto[];

  static from(centre: Centre): CentreEntityDto {
    return {
      id: centre.id,
      name: centre.name,
      classes: centre.classCentres
        ? centre.classCentres.map((classCentre) =>
            ClassEntityDto.fromObject(classCentre),
          )
        : [],
    };
  }

  static fromMany(centres: Centre[]): CentreEntityDto[] {
    return centres.map((centre) => CentreEntityDto.from(centre));
  }
}

export class CreateCentreDto extends PickType(CentreEntityDto, [
  "name",
] as const) {}

export class UpdateCentreDto extends CreateCentreDto {}
