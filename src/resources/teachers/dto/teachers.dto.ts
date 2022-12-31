import { Expose } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class UpdateTeacherDto {
  @IsString()
  @IsNotEmpty()
  @Expose({ name: "staff_id" })
  staffId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class CreateTeacherDto extends UpdateTeacherDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class TeacherDto extends CreateTeacherDto {
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  id!: string;
}
