import { WordDifficulty } from "entities/word.entities";
import { IsNotEmpty, IsString } from "class-validator";

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

  @IsNotEmpty()
  @IsString()
  difficulty!: WordDifficulty;
}
