import { Expose, plainToClass } from "class-transformer";
import { Identifier, UpdateStamp } from "./common";
import { IsNotEmpty, IsString } from "class-validator";

export class CentreDatum {
  @IsNotEmpty()
  @IsString()
  @Expose()
  name!: string;
}

export class CentreEntity {
  identifier!: Identifier;
  datum!: CentreDatum;
  updateStamp!: UpdateStamp;

  static fromObject(object: object): CentreEntity {
    const centre = new CentreEntity();
    centre.identifier = plainToClass(Identifier, object);
    centre.datum = plainToClass(CentreDatum, object);
    centre.updateStamp = plainToClass(UpdateStamp, object);
    return centre;
  }
}
