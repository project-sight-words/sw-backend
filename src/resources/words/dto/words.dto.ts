import { Word, WordDifficulty } from "entities/word.entities";
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class EditWordDto {
  @IsNotEmpty()
  @IsString()
  sentence!: string;

  @IsString()
  @IsOptional()
  comment: string | null = null;

  @IsNotEmpty()
  @IsString()
  @IsIn(["Basic", "Intermediate", "Advanced"])
  difficulty!: WordDifficulty;
}

export class CreateWordDto extends EditWordDto {
  @IsNotEmpty()
  @IsString()
  word!: string;

  @IsNotEmpty()
  @IsOptional()
  definition: string | null = null;
}

export class WordDto extends CreateWordDto {
  @IsUUID()
  id!: string;

  @IsArray()
  audios!: string[];

  @IsArray()
  images!: string[];

  static from(word: Word): WordDto {
    return {
      id: word.id,
      word: word.word,
      definition: word.definition,
      sentence: word.sentence,
      comment: word.comment,
      difficulty: word.difficulty,
      audios: word.audios ? word.audios.map((a) => a.link) : [],
      images: word.images ? word.images.map((i) => i.link) : [],
    };
  }
}
