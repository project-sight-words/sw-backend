import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ClassStudent } from "entities/class.entities";
import { Lesson, LessonDatum } from "entities/lesson.entities";
import { Repository } from "typeorm";

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(ClassStudent)
    private readonly classStudentRepository: Repository<ClassStudent>,
  ) {}

  async findByClassId(classId: string): Promise<Lesson[]> {
    const lessons = await this.lessonRepository.find({
      withDeleted: false,
      where: {
        classId: classId,
      },
    });
    return lessons;
  }

  async findByStudentId(studentId: string): Promise<Lesson[]> {
    const classStudents = await this.classStudentRepository.find({
      withDeleted: false,
      where: {
        studentId: studentId,
      },
    });

    const lessonPromises = classStudents.map((classStudent) => {
      return this.lessonRepository.find({
        withDeleted: false,
        where: {
          classId: classStudent.classId,
        },
      });
    });

    const lessonsNested = await Promise.all(lessonPromises);
    const lessons = lessonsNested.flat();

    lessons.sort((a, b) => b.startDate.getTime() - a.startDate.getTime()); // DESC order (most recent first)

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
    startDate: Date,
    endDate: Date,
    classId: string,
    createdBy: string | null = null,
  ): Promise<Lesson> {
    return await this.lessonRepository.save({
      startDate: startDate,
      endDate: endDate,
      classId: classId,
      createdBy: createdBy,
    });
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
