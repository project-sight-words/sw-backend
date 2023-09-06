import { PickType } from "@nestjs/mapped-types";
import { Expose, Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsUUID, ValidateNested } from "class-validator";
import { LessonWord } from "entities/lessonWord.entities";
import { DetailedWordAttemptDto } from "resources/wordAttempts/dto/wordAttempt.dto";
import { WordDto } from "resources/words/dto/words.dto";
import { IsNull } from "typeorm";

export class LessonWordDto {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @Expose({ name: "word_id" })
  @IsNotEmpty()
  @IsUUID()
  wordId!: string;

  @Expose({ name: "lesson_id" })
  @IsNotEmpty()
  @IsUUID()
  lessonId!: string;

  static fromLessonWord(lessonWord: LessonWord): LessonWordDto {
    return {
      id: lessonWord.id,
      wordId: lessonWord.wordId,
      lessonId: lessonWord.lessonId,
    };
  }
  static fromLessonWords(lessonWords: LessonWord[]): LessonWordDto[] {
    return lessonWords.map((lessonWord) =>
      LessonWordDto.fromLessonWord(lessonWord),
    );
  }
}

export class CreateLessonWordDto extends PickType(LessonWordDto, [
  "wordId",
  "lessonId",
] as const) {}

export class DetailedLessonWordDto {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WordDto)
  word!: WordDto;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetailedLessonWordDto)
  attempts!: DetailedWordAttemptDto[];

  static fromLessonWord(
    lessonWord: LessonWord,
    studentId?: string,
  ): DetailedLessonWordDto {
    return {
      id: lessonWord.id,
      word: WordDto.from(lessonWord.word),
      attempts: DetailedWordAttemptDto.fromEntities(
        lessonWord.attempts.filter(
          // only filter if studentId is provided
          (attempt) => !studentId || attempt.student.id === studentId,
        ) || [],
      ),
    };
  }

  static fromLessonWords(
    lessonWords: LessonWord[],
    studentId?: string,
  ): DetailedLessonWordDto[] {
    return lessonWords
      .filter((lessonWord) => lessonWord && lessonWord.word !== null)
      .map((lessonWord) =>
        DetailedLessonWordDto.fromLessonWord(lessonWord, studentId),
      );
  }
}
