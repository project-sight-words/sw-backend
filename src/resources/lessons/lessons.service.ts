import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Lesson, LessonDatum } from "entities/lesson.entities";
import { Repository } from "typeorm";

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  async getByClassId(classId: string): Promise<Lesson[]> {
    const lessons = await this.lessonRepository.find({
      withDeleted: false,
      where: {
        classId: classId,
      },
    });
    return lessons;
  }

  async findOneById(id: string): Promise<Lesson | null> {
    const lesson = await this.lessonRepository.findOne({
      withDeleted: false,
      where: {
        id: id,
      },
    });
    return lesson;
  }

  async create(
    lesson: LessonDatum,
    createdBy: string | null = null,
  ): Promise<Lesson> {
    const { startDate, endDate, classId } = lesson;
    const { generatedMaps } = await this.lessonRepository
      .createQueryBuilder()
      .insert()
      .into(Lesson)
      .values([{ startDate, endDate, classId, createdBy }])
      .returning("*")
      .execute();

    return Lesson.from(generatedMaps)[0];
  }

  async updateById(id: string, updateLesson: LessonDatum) {
    const { startDate, endDate, classId } = updateLesson;
    await this.lessonRepository
      .createQueryBuilder()
      .update(Lesson)
      .set({ startDate, endDate, classId })
      .where({ id })
      .execute();
    return this.findOneById(id);
  }

  async deleteById(id: string): Promise<void> {
    const results = await this.lessonRepository
      .createQueryBuilder()
      .softDelete()
      .where({ id })
      .andWhere("deleted_at IS NULL")
      .execute();
    if (results.affected && results.affected !== 1)
      throw new InternalServerErrorException();
  }
}
