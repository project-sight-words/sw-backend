import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessonWord } from "entities/lessonWord.entities";
import { Repository } from "typeorm";
import { DetailedLessonWordDto } from "./dto/lessonWords.dto";

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

  async findByLessonIds(
    lessonIds: string[],
    studentId?: string,
  ): Promise<DetailedLessonWordDto[]> {
    const results: DetailedLessonWordDto[][] = [];

    for (const lessonId of lessonIds) {
      const lessonWords = await this.lessonWordRepository.find({
        relations: {
          word: true,
          attempts: {
            quizAttempt: false,
            student: true,
          },
        },
        where: {
          lessonId: lessonId,
        },
      });

      const filteredAttempts = lessonWords
        .filter((lessonWord) => lessonWord && lessonWord.word)
        .map((lessonWord) => {
          if (lessonWord.attempts) {
            lessonWord.attempts = lessonWord.attempts.filter(
              (attempt) =>
                attempt && (!studentId || attempt.studentId === studentId),
            );
          }
          return lessonWord;
        });

      results.push(
        DetailedLessonWordDto.fromLessonWords(filteredAttempts, studentId),
      );
    }

    return results.flat();
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
    const existing = await this.lessonWordRepository.findOne({
      where: { wordId, lessonId },
      withDeleted: true,
    });

    if (existing?.deletedAt) {
      // await this.lessonWordRepository.restore(existing.id);
      // Update any fields as necessary here
      existing.deletedAt = null;
      existing.createdBy = createdBy;
      return await this.lessonWordRepository.save(existing);
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
