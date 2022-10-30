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

export class GetTeacherDto extends CreateTeacherDto {}

export class UpdateTeacherDto extends CreateTeacherDto {}

export class DeleteTeacherDto extends CreateTeacherDto {}
