import { Expose } from "class-transformer";
import { IsEmail, IsNotEmpty, IsUUID } from "class-validator";
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

  static fromUserEntity(userEntity: UserEntity): JwtPayload {
    const plain = UserEntity.toObject(userEntity);
    const payload = plainToInstance(JwtPayload, plain);
    return payload;
  }
}
