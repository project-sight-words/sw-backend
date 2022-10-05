import { Expose } from "class-transformer";
import { IsEmail, IsNotEmpty, IsUUID } from "class-validator";

export class JwtPayload {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}
