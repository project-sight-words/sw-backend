import { GetUserDto } from "resources/users/dto/users.dto";
import { Roles } from "resources/authentication/authentication.types";
import { Type } from "class-transformer";
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from "class-validator";

export class AuthenticateDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class LoggedInDto {
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => GetUserDto)
  user!: GetUserDto;

  @IsEnum(Roles, { each: true })
  @IsNotEmpty()
  roles!: Roles[];
}
