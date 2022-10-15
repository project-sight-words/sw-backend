import { IsString, IsNotEmpty, IsEmail } from "class-validator";

export class CreateTeacherDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  staffId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class UpdateTeacherDto {
  @IsString()
  staffId!: string;

  @IsString()
  name!: string;
}
