import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Lesson } from "entities/lesson.entities";
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
}
