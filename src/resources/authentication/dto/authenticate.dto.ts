import { Roles } from "entities/role.entities";
import { Type } from "class-transformer";
import { UserEntityDto } from "resources/users/dto/users.dto";
import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from "class-validator";

export class LoginInDevelopmentDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class LoginWithGoogleDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class LoggedInDto {
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => UserEntityDto)
  user!: UserEntityDto;

  @IsEnum(Roles, { each: true })
  @IsNotEmpty()
  roles!: Roles[];
}
