import { Expose } from "class-transformer";
import { Identifier, UpdateStamp } from "./common";
import { IsNotEmpty, IsString } from "class-validator";
import { plainToInstance } from "utils/transformer";

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
    centre.identifier = plainToInstance(Identifier, object);
    centre.datum = plainToInstance(CentreDatum, object);
    centre.updateStamp = plainToInstance(UpdateStamp, object);
    return centre;
  }
}
