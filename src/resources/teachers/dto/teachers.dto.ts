import { IsString, IsNotEmpty, IsEmail, IsUUID } from "class-validator";

export class CreateTeacherDto {
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  id!: string;

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
