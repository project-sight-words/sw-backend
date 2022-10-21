import { Expose } from "class-transformer";
import { IsNotEmpty, IsUUID } from "class-validator";

export class AddClassToCentreDto {
  @IsUUID()
  @IsNotEmpty()
  @Expose({ name: "class_id" })
  classId!: string;
}
