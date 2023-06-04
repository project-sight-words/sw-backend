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
import { Role } from "entities/roles.entities";
import { UserEntityDto } from "resources/users/dto/users.dto";
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

export class LoggedInDto {
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => User)
  user!: User;

  @IsEnum(Role, { each: true })
  @IsNotEmpty()
  roles!: Role[];
}

export class RefreshDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
