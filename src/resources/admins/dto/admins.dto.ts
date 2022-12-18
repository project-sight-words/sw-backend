import { Exclude, Expose } from "class-transformer";
import { IsNotEmpty, IsEmail, IsUUID } from "class-validator";

export class CreateAdminDto {
  @IsNotEmpty()
  @Expose()
  @IsEmail()
  email!: string;
}

@Exclude()
export class AdminDto extends CreateAdminDto {
  @IsNotEmpty()
  @Expose({ name: "id" })
  @IsUUID()
  id!: string;
}
