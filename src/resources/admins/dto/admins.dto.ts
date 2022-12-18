import { IsNotEmpty, IsEmail } from "class-validator";

export class CreateAdminDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
