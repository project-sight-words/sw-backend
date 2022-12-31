import { Expose, plainToClass } from "class-transformer";
import { Identifier, UpdateStamp } from "./common";
import { IsNotEmpty, IsString } from "class-validator";

export class Centre {
  @IsNotEmpty()
  @IsString()
  @Expose()
  name!: string;
}

export class CentreEntity {
  identifier!: Identifier;
  centre!: Centre;
  updateStamp!: UpdateStamp;

  static fromObject(object: object): CentreEntity {
    const centre = new CentreEntity();
    centre.identifier = plainToClass(Identifier, object);
    centre.centre = plainToClass(Centre, object);
    centre.updateStamp = plainToClass(UpdateStamp, object);
    return centre;
  }
}
