import { Expose } from "class-transformer";
import { IsArray, IsEmail, IsNotEmpty, IsUUID } from "class-validator";
import { Role } from "./roles.entities";

export class JwtPayload {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Expose()
  @IsArray()
  roles!: Role[];
}
