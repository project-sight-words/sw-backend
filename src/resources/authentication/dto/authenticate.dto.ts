import { Type } from "class-transformer";
import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Role } from "entities/roles.entities";
import { User } from "../../../entities/user.entities";

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

export class RefreshDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class AccessDto extends RefreshDto {
  @IsNotEmpty()
  @IsString()
  accessToken!: string;
}

export class LoggedInDto extends AccessDto {
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => User)
  user!: User;

  @IsEnum(Role, { each: true })
  @IsNotEmpty()
  roles!: RoleDto[];
}

export class RoleDto {
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsEnum(Role, { each: true })
  @IsNotEmpty()
  role!: string;

  @IsString()
  @IsNotEmpty()
  role_id?: string;
}
