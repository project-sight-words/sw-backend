import { Expose } from "class-transformer";
import { IsNotEmpty, IsUUID } from "class-validator";
import { LessonWord, LessonWordDatum } from "entities/lessonWord.entities";

export class CreateLessonWordDto extends LessonWordDatum {}

export class LessonWordDto extends LessonWordDatum {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

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

export class GetLessonWordDto {
  @Expose({ name: "lesson_id" })
  @IsNotEmpty()
  @IsUUID()
  lessonId!: string;
}
