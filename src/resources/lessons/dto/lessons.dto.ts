import { Expose } from "class-transformer";
import { IsNotEmpty, IsUUID } from "class-validator";
import { Lesson, LessonDatum } from "entities/lesson.entities";

export class CreateLessonDto extends LessonDatum {}

export class LessonDto extends LessonDatum {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  static fromLesson(lesson: Lesson): LessonDto {
    return {
      id: lesson.id,
      startDate: lesson.startDate,
      endDate: lesson.endDate,
      classId: lesson.classId,
    };
  }

  static fromLessons(lessons: Lesson[]): LessonDto[] {
    return lessons.map((lesson) => LessonDto.fromLesson(lesson));
  }
}
