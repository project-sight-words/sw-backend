import { Expose } from "class-transformer";
import { IsDate, IsEmail, IsNotEmpty } from "class-validator";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { instanceToPlain, plainToInstance } from "utils/transformer";
import { Identifier } from "./common";
import { StudentUser } from "./student.entities";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  email!: string;

  @Column({ name: "last_logged_in", type: "date", nullable: true })
  lastLoggedIn: Date | null = null;

  @OneToMany(() => StudentUser, (studentUser) => studentUser.userId)
  studentUsers: StudentUser[] | null = null;
}

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
  identifier!: Identifier;
  datum!: UserDatum;

  static fromObject(object: object): UserEntity {
    const user = new UserEntity();
    user.identifier = Identifier.fromObject(object);
    user.datum = UserDatum.fromObject(object);
    return user;
  }

  static toObject(entity: UserEntity): object {
    const { datum, identifier: identitifier } = entity;
    return {
      ...UserDatum.toObject(datum),
      ...Identifier.toObject(identitifier),
    };
  }
}
