import { Expose } from "class-transformer";
import { IsArray, IsEmail, IsNotEmpty, IsUUID } from "class-validator";
import { Role } from "./roles.entities";
import { plainToInstance } from "utils/transformer";
import { UserEntity } from "./user.entities";

export class JwtPayload {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Expose()
  @IsArray()
  roles!: Role[];
  static fromUserEntity(userEntity: UserEntity): JwtPayload {
    const plain = UserEntity.toObject(userEntity);
    const payload = plainToInstance(JwtPayload, plain);
    return payload;
  }
}
