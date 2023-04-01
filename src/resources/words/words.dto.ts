import { Word, WordDifficulty } from "entities/word.entities";
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateWordDto {
  @IsNotEmpty()
  @IsString()
  word!: string;

  @IsNotEmpty()
  @IsString()
  definition!: string;

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

export class WordDto extends CreateWordDto {
  @IsArray()
  audios!: string[];

  @IsArray()
  images!: string[];

  static from(word: Word): WordDto {
    return {
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
