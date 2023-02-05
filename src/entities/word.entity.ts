import { CreateStamp, DeleteStamp, Identifier } from "./common";
import { Expose, instanceToPlain, Type } from "class-transformer";
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { plainToInstance } from "utils/transformer";

export class WordDatum {
  @Expose()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => WordMeaningDatum)
  meanings!: WordMeaningDatum[];

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => WordLabelDatum)
  labels!: WordLabelDatum[];

  static fromObject(object: object): WordDatum {
    const datum = plainToInstance(WordDatum, object);
    return datum;
  }

  static toObject(datum: WordDatum): object {
    const plain = instanceToPlain(datum);
    return plain;
  }
}

export class WordEntity {
  datum!: WordDatum;
  createStamp!: CreateStamp;
  deleteStamp!: DeleteStamp;

  static fromObject(object: object): WordEntity {
    const entity = new WordEntity();
    entity.datum = WordDatum.fromObject(object);
    entity.createStamp = CreateStamp.fromObject(object);
    entity.deleteStamp = DeleteStamp.fromObject(object);
    return entity;
  }
}

export class WordMeaningDatum {
  @Expose()
  @IsNotEmpty()
  @IsString()
  definition!: string;
}

export class WordMeaningEntity {
  identifier!: Identifier;
  datum!: WordMeaningDatum;
  createStamp!: CreateStamp;
  deleteStamp!: DeleteStamp;
}

export class WordLabelDatum {
  @Expose()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;
}

export class WordLabelEntity {
  identifier!: Identifier;
  datum!: WordLabelDatum;
  createStamp!: CreateStamp;
  deleteStamp!: DeleteStamp;
}
