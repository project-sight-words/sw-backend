import { Expose } from "class-transformer";
import { Identifier } from "./common";
import { instanceToPlain, plainToInstance } from "utils/transformer";
import { IsDate, IsEmail, IsNotEmpty } from "class-validator";

export class UserDatum {
  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Expose({ name: "last_logged_in" })
  @IsDate()
  lastLoggedIn!: Date | null;

  static fromObject(object: object): UserDatum {
    const datum = plainToInstance(UserDatum, object);
    return datum;
  }

  static toObject(datum: UserDatum): object {
    const plain = instanceToPlain(datum);
    return plain;
  }
}

export class UserEntity {
  identitifier!: Identifier;
  datum!: UserDatum;

  static fromObject(object: object): UserEntity {
    const user = new UserEntity();
    user.identitifier = Identifier.fromObject(object);
    user.datum = UserDatum.fromObject(object);
    return user;
  }

  static toObject(entity: UserEntity): object {
    const { datum, identitifier } = entity;
    return {
      ...UserDatum.toObject(datum),
      ...Identifier.toObject(identitifier),
    };
  }
}
