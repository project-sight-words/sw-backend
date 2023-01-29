import { Expose } from "class-transformer";
import { IsDate, IsEmail, IsNotEmpty } from "class-validator";
import { Identifier } from "./common";
import { plainToInstance } from "utils/transformer";

export class UserDatum {
  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Expose({ name: "last_logged_in" })
  @IsDate()
  lastLoggedIn!: Date | null;
}

export class UserEntity {
  identitifier!: Identifier;
  datum!: UserDatum;

  static fromObject(object: object): UserEntity {
    const user = new UserEntity();
    user.identitifier = plainToInstance(Identifier, object);
    user.datum = plainToInstance(UserDatum, object);
    return user;
  }
}
