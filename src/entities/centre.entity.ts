import { Expose } from "class-transformer";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class Centre {
  @IsNotEmpty()
  @IsUUID()
  @Expose()
  id!: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  name!: string;
}

export class ClassToCentre {
  @IsNotEmpty()
  @IsUUID()
  @Expose({ name: "centre_id" })
  centreId!: string;

  @IsNotEmpty()
  @IsUUID()
  @Expose({ name: "class_id" })
  classId!: string;
}
