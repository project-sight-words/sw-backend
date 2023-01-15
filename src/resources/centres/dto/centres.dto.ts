import { CentreDatum, CentreEntity } from "entities/centre.entity";
import { Expose, plainToClass } from "class-transformer";
import { instanceToPlain, plainToInstance } from "utils/transformer";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CentreDatumDto extends CentreDatum {
  @Expose()
  @IsNotEmpty()
  @IsString()
  name!: string;

  static toCentreDatum(dto: CentreDatumDto): CentreDatum {
    const plain = instanceToPlain(dto);
    const datum = plainToClass(CentreDatum, plain);
    return datum;
  }

  static fromCentreDatum(centre: CentreDatum): CentreDatumDto {
    const plain = instanceToPlain(centre);
    const dto = plainToClass(CentreDatumDto, plain);
    return dto;
  }
}

export class CentreEntityDto extends CentreDatumDto {
  @IsNotEmpty()
  @Expose()
  @IsUUID()
  id!: string;

  static fromCentreEntity(entity: CentreEntity): CentreEntityDto {
    const { identifier, datum } = entity;
    const datumDto = CentreDatumDto.fromCentreDatum(datum);
    const dto = plainToInstance(CentreEntityDto, {
      ...instanceToPlain(datumDto),
      ...instanceToPlain(identifier),
    });
    return dto;
  }
}
