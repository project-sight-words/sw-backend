import { Expose } from "class-transformer";
import { Identifier, UpdateStamp } from "./common";
import { IsNotEmpty, IsString } from "class-validator";
import { plainToInstance } from "utils/transformer";

export class CentreDatum {
  @IsNotEmpty()
  @IsString()
  @Expose()
  name!: string;

  static fromObject(object: object): CentreDatum {
    const datum = plainToInstance(CentreDatum, object);
    return datum;
  }
}

export class CentreEntity {
  identifier!: Identifier;
  datum!: CentreDatum;
  updateStamp!: UpdateStamp;

  static fromObject(object: object): CentreEntity {
    const centre = new CentreEntity();
    centre.identifier = Identifier.fromObject(object);
    centre.datum = CentreDatum.fromObject(object);
    centre.updateStamp = UpdateStamp.fromObject(object);
    return centre;
  }
}
