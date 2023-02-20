import { Expose, Type } from "class-transformer";
import { IsArray, IsString, IsUUID, ValidateNested } from "class-validator";
import { ClassEntityDto } from "resources/classes/dto/classes.dto";

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
}
