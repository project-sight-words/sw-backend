import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessonWord, LessonWordDatum } from "entities/lessonWord.entities";
import { Repository } from "typeorm";

@Injectable()
export class LessonWordsService {
  constructor(
    @InjectRepository(LessonWord)
    private readonly lessonWordRepository: Repository<LessonWord>,
  ) {}

  async getByLessonId(lessonId: string): Promise<LessonWord[]> {
    const lessonWords = await this.lessonWordRepository.find({
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
    lessonWord: LessonWordDatum,
    createdBy: string | null = null,
  ): Promise<LessonWord> {
    const { wordId, lessonId } = lessonWord;
    const { generatedMaps } = await this.lessonWordRepository
      .createQueryBuilder()
      .insert()
      .into(LessonWord)
      .values([{ wordId, lessonId, createdBy }])
      .returning("*")
      .execute();

    return LessonWord.from(generatedMaps)[0];
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
