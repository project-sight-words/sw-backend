import { Exclude, Expose } from "class-transformer";
import { IsNotEmpty, IsEmail, IsUUID } from "class-validator";

export class CreateAdminDto {
  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}

@Exclude()
export class AdminDto extends CreateAdminDto {
  @Expose({ name: "id" })
  @IsNotEmpty()
  @IsUUID()
  id!: string;
}
