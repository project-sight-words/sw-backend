import { Expose } from "class-transformer";
import { IsDate, IsEmail, IsNotEmpty, IsUUID } from "class-validator";

export class NewUser {
  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Expose({ name: "last_logged_in" })
  @IsDate()
  lastLoggedIn!: Date | null;
}

export class User extends NewUser {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  id!: string;
}
