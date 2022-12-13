import { GetUserDto } from "resources/users/dto/users.dto";
import { Roles } from "entities/roles.entities";
import { Type } from "class-transformer";
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
  @Type(() => GetUserDto)
  user!: GetUserDto;

  @IsEnum(Roles, { each: true })
  @IsNotEmpty()
  roles!: Roles[];
}

export class RefreshDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
