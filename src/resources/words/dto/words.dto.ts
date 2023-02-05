import {
  WordDatum,
  WordEntity,
  WordLabelDatum,
  WordMeaningDatum,
} from "entities/word.entity";
import { instanceToPlain, plainToInstance } from "utils/transformer";

export class WordDatumDto extends WordDatum {
  static toObject(dto: WordDatumDto): object {
    const plain = instanceToPlain(dto);
    return plain;
  }

  static fromWordDatum(datum: WordDatum): WordDatumDto {
    const plain = WordDatum.toObject(datum);
    const dto = plainToInstance(WordDatumDto, plain);
    return dto;
  }
}

export class WordEntityDto extends WordDatumDto {
  static fromWordEntity(entity: WordEntity): WordEntityDto {
    const { datum } = entity;
    const datumDto = WordDatumDto.fromWordDatum(datum);
    const dto = plainToInstance(WordEntityDto, {
      ...WordDatumDto.toObject(datumDto),
    });
    return dto;
  }
}

export class WordMeaningDatumDto extends WordMeaningDatum {}

export class WordLabelDatumDto extends WordLabelDatum {}
