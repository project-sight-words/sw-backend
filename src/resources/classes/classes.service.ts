import { Injectable, Logger } from "@nestjs/common";
import {
  Class,
  ClassCentre,
  ClassStudent,
  ClassTeacher,
} from "entities/class.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Student } from "entities/student.entities";
import { ClassDatum } from "./dto/classes.dto";

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private readonly classesRepository: Repository<Class>,
    @InjectRepository(ClassStudent)
    private readonly ClassStudentRepository: Repository<ClassStudent>,
    @InjectRepository(ClassTeacher)
    private readonly ClassTeacherRepository: Repository<ClassTeacher>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(ClassCentre)
    private readonly classCentreRepository: Repository<ClassCentre>,
  ) {}

  private readonly loggerService = new Logger("ClassesService");

  async get(): Promise<Class[]> {
    const classes = await this.classesRepository.find({
      relations: {
        classStudents: {
          student: true,
        },
        classTeachers: {
          teacher: true,
        },
        classCentre: {
          centre: true,
        },
      },
    });
    return classes;
  }

  async findOneById(id: string): Promise<Class | null> {
    const classEntity = await this.classesRepository.findOne({
      relations: {
        classStudents: {
          student: true,
        },
        classTeachers: {
          teacher: true,
        },
        classCentre: {
          centre: true,
        },
      },
      where: {
        id,
      },
    });
    console.log("classEntity", classEntity);

    return classEntity;
  }

  async create(classEntity: ClassDatum): Promise<Class> {
    const createdClass = this.classesRepository.create(classEntity);
    await this.classesRepository.save(createdClass);
    return createdClass;
  }

  async addStudentToClass(classId: string, studentId: string) {
    await this.ClassStudentRepository.insert({
      classId: classId,
      studentId: studentId,
    });
  }

  async addTeacherToClass(
    classId: string,
    teacherId: string,
    isFormTeacher: boolean,
  ) {
    await this.ClassTeacherRepository.insert({
      classId: classId,
      teacherId: teacherId,
      isFormTeacher: isFormTeacher,
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

  async updateById(id: string, classDatum: ClassDatum): Promise<Class> {
    // classEntity.updatedAt = new Date(); // Consider using afterUpdate() listener
    // classEntity.updatedBy = null; // TODO: Change after authentication
    const classEntity = await this.classesRepository.findOneByOrFail({ id });
    const updatedClass = this.classesRepository.merge(classEntity, classDatum);
    await this.classesRepository.save(updatedClass);
    return updatedClass;
  }

  async getStudentssInClass(classId: string): Promise<Student[]> {
    const students = await this.studentsRepository.find({
      where: {
        classStudents: {
          classId: classId,
        },
      },
    });

    return students;
  }

  async getClassesWithStudents(): Promise<Class[]> {
    const classes = await this.classesRepository.find({
      relations: {
        classStudents: {
          student: true,
        },
      },
    });
    return classes;
  }

  async addClassToCentre(centreId: string, classId: string) {
    await this.classCentreRepository.insert({
      centreId: centreId,
      classId: classId,
    });
  }

  async removeClassFromCentre(centreId: string, classId: string) {
    await this.classCentreRepository.softDelete({
      centreId: centreId,
      classId: classId,
    });
  }

  // Why classes got no soft delete??
  async deleteById(id: string): Promise<Class> {
    const entity = await this.classesRepository.findOneByOrFail({ id });
    await this.classesRepository.delete({ id });
    return entity;
  }
}
