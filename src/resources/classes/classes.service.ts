import { ClassesRepository } from "./classes.repository";
import { Injectable, Logger } from "@nestjs/common";
import { Class, ClassStudent, ClassTeacher } from "entities/class.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Student } from "entities/student.entities";

@Injectable()
export class ClassesService {
  constructor(
    private classesRepository: ClassesRepository,
    @InjectRepository(ClassStudent)
    private ClassStudentRepository: Repository<ClassStudent>,
    @InjectRepository(ClassTeacher)
    private ClassTeacherRepository: Repository<ClassTeacher>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
  ) {}

  private readonly loggerService = new Logger("ClassesService");

  async get(): Promise<Class[]> {
    const classes = await this.classesRepository.find();
    return classes;
  }

  async searchById(id: string): Promise<Class | null> {
    const classEntity = await this.classesRepository.findOneBy({ id });
    return classEntity;
  }

  async create(classEntity: Class): Promise<Class> {
    const createdClass = await this.classesRepository.save(classEntity);
    return createdClass;
  }

  async addStudentToClass(classId: string, studentId: string) {
    await this.ClassStudentRepository.insert({
      classId: classId,
      studentId: studentId,
    });
  }

  async addTeacherToClass(classId: string, teacherId: string) {
    await this.ClassTeacherRepository.insert({
      classId: classId,
      teacherId: teacherId,
    });
  }

  async removeTeacherFromClass(classId: string, teacherId: string) {
    await this.ClassTeacherRepository.softDelete({
      classId: classId,
      teacherId: teacherId,
    });
  }

  async removeStudentFromClass(classId: string, studentId: string) {
    await this.ClassStudentRepository.softDelete({
      classId: classId,
      studentId: studentId,
    });
  }

  async updateById(id: string, classEntity: Class): Promise<Class> {
    classEntity.updatedAt = new Date();
    // classEntity.updatedBy = null; // TODO: Change after authentication
    await this.classesRepository.update(id, classEntity);
    return classEntity;
  }

  // Example of relations with Query Builder
  // TODO: Standardise after decision on earger loading
  async getStudentssInClass(classId: string): Promise<Student[]> {
    const students = await this.studentsRepository
      .createQueryBuilder()
      .leftJoin(
        "class_students",
        "classStudents",
        "classStudents.studentId = Student.id",
      )
      .where("class_id = :classId", { classId })
      .select("Student")
      .getMany();

    return students;
  }

  // Example of relations with find()
  // TODO: Standardise after decision on earger loading
  async getClassesWithStudents(): Promise<Class[]> {
    const classes = await this.classesRepository.find({
      relations: {
        classStudents: {
          student: true,
        },
      },
    });
    classes.forEach(
      (q) => (q.students = q.classStudents.map((cs) => cs.student)),
    );
    return classes;
  }

  // Why classes got no soft delete??
  async deleteById(id: string): Promise<Class> {
    const entity = await this.classesRepository.findOneByOrFail({ id });
    await this.classesRepository.delete({ id });
    return entity;
  }
}
