import { Expose } from "class-transformer";
import { instanceToPlain, plainToInstance } from "utils/transformer";
import { IsNotEmpty, IsUUID } from "class-validator";
import { UserDatum, UserEntity } from "entities/user.entities";

export class UserDatumDto extends UserDatum {
  static fromUserDatum(datum: UserDatum): UserDatumDto {
    const plain = instanceToPlain(datum);
    const dto = plainToInstance(UserDatumDto, plain);
    return dto;
  }
}

export class UserEntityDto extends UserDatumDto {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  static fromUserEntity(entity: UserEntity): UserEntityDto {
    const { datum, identifier: identitifier } = entity;
    const datumDto = UserDatumDto.fromUserDatum(datum);
    const dto = plainToInstance(UserEntityDto, {
      ...instanceToPlain(datumDto),
      ...instanceToPlain(identitifier),
    });
    return dto;
  }
}

export class UserDto {}
