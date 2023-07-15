import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessonWord } from "entities/lessonWord.entities";
import { Repository } from "typeorm";

@Injectable()
export class LessonWordsService {
  constructor(
    @InjectRepository(LessonWord)
    private readonly lessonWordRepository: Repository<LessonWord>,
  ) {}

  async findByLessonId(lessonId: string): Promise<LessonWord[]> {
    const lessonWords = await this.lessonWordRepository.find({
      relations: {
        word: true,
        attempts: {
          quizAttempt: true,
          student: true,
        },
      },
      withDeleted: false,
      where: {
        lessonId: lessonId,
      },
    });
    return lessonWords;
  }

  async findOneById(id: string): Promise<LessonWord | null> {
    const lessonWord = await this.lessonWordRepository.findOne({
      withDeleted: false,
      where: {
        id: id,
      },
    });
    return lessonWord;
  }

  async create(
    wordId: string,
    lessonId: string,
    createdBy: string | null = null,
  ): Promise<LessonWord> {
    const existingLessonWord = await this.lessonWordRepository.findOne({
      where: { wordId, lessonId },
      withDeleted: true,
    });

    if (existingLessonWord && existingLessonWord.deletedAt) {
      await this.lessonWordRepository.restore(existingLessonWord.id);
      return existingLessonWord;
    }

    return this.lessonWordRepository.save({
      wordId: wordId,
      lessonId: lessonId,
      createdBy: createdBy,
    });
  }

  async deleteById(id: string): Promise<void> {
    const results = await this.lessonWordRepository
      .createQueryBuilder()
      .softDelete()
      .where({ id })
      .andWhere("deleted_at IS NULL")
      .execute();
    if (results.affected && results.affected !== 1)
      throw new InternalServerErrorException();
  }
}
