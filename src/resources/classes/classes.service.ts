import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import {
  Class,
  ClassCentre,
  ClassStudent,
  ClassTeacher,
} from "entities/class.entities";
import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Student, StudentUser } from "entities/student.entities";
import { ClassDatum } from "./dto/classes.dto";
import { Teacher, TeacherUser } from "entities/teacher.entities";

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
    @InjectRepository(Teacher)
    private readonly teachersRepository: Repository<Teacher>,
    @InjectRepository(ClassCentre)
    private readonly classCentreRepository: Repository<ClassCentre>,
    private readonly dataSource: DataSource,
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

    return classEntity;
  }

  async create(classEntity: ClassDatum): Promise<Class> {
    const newClass = this.classesRepository.create(classEntity);
    const createdClass = await this.dataSource.transaction(
      async (entityManager) => {
        const createdClass = await entityManager.save(newClass);
        await entityManager.insert(ClassCentre, {
          classId: createdClass.id,
          centreId: classEntity.centreId,
        });
        return createdClass;
      },
    );
    return createdClass;
  }

  async addStudentToClass(classId: string, studentId: string) {
    const existing = await this.ClassStudentRepository.findOne({
      where: {
        classId: classId,
        studentId: studentId,
      },
      withDeleted: true,
    });

    if (existing?.deletedAt) {
      await this.ClassStudentRepository.restore(existing.id);
      return existing;
    }

    await this.ClassStudentRepository.save({
      classId: classId,
      studentId: studentId,
    });
  }

  async addTeacherToClass(
    classId: string,
    teacherId: string,
    isFormTeacher: boolean,
  ) {
    const existing = await this.ClassTeacherRepository.findOne({
      where: {
        classId: classId,
        teacherId: teacherId,
        isFormTeacher: isFormTeacher,
      },
      withDeleted: true,
    });

    if (existing?.deletedAt) {
      await this.ClassTeacherRepository.restore(existing.id);
      return existing;
    }
    await this.ClassTeacherRepository.save({
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
    const classEntity = await this.classesRepository.findOneBy({ id });
    if (!classEntity) throw new NotFoundException();
    const updatedClass = this.classesRepository.merge(classEntity, classDatum);
    await this.classesRepository.save(updatedClass);
    return updatedClass;
  }

  async getTeachersInClass(classId: string): Promise<TeacherUser[]> {
    const teachers = await this.dataSource
      .getRepository(TeacherUser)
      .createQueryBuilder("teacherUser")
      .innerJoin(
        ClassTeacher,
        "classTeacher",
        "classTeacher.teacherId = teacherUser.teacherId",
      )
      .innerJoinAndSelect("teacherUser.teacher", "teacher")
      .innerJoinAndSelect("teacherUser.user", "user")
      .where("classTeacher.classId = :classId", { classId })
      .getMany();

    return teachers;
  }

  async getStudentsInClass(classId: string): Promise<StudentUser[]> {
    const students = await this.dataSource
      .getRepository(StudentUser)
      .createQueryBuilder("studentUser")
      .innerJoin(
        ClassStudent,
        "classStudent",
        "classStudent.studentId = studentUser.studentId",
      )
      .innerJoinAndSelect("studentUser.student", "student")
      .innerJoinAndSelect("studentUser.user", "user")
      .where("classStudent.classId = :classId", { classId })
      .getMany();

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

  async getClassesByStudent(studentId: string): Promise<Class[]> {
    const classes = await this.classesRepository.find({
      relations: {
        classStudents: { student: true },
        classTeachers: { teacher: true },
        classCentre: { centre: true },
      },
      where: {
        classStudents: { studentId },
      },
    });
    return classes;
  }

  async getClassesByTeacher(teacherId: string): Promise<Class[]> {
    const classes = await this.classesRepository.find({
      relations: {
        classStudents: { student: true },
        classTeachers: { teacher: true },
        classCentre: { centre: true },
      },
      where: {
        classTeachers: { teacherId },
      },
    });
    return classes;
  }

  async getClassesByStudentAndTeacher(
    studentId: string,
    teacherId: string,
  ): Promise<Class[]> {
    const classes = await this.classesRepository.find({
      relations: {
        classStudents: { student: true },
        classTeachers: { teacher: true },
        classCentre: { centre: true },
      },
      where: {
        classStudents: { studentId },
        classTeachers: { teacherId },
      },
    });
    return classes;
  }

  async addClassToCentre(centreId: string, classId: string) {
    const existing = await this.classCentreRepository.findOne({
      where: {
        centreId: centreId,
        classId: classId,
      },
      withDeleted: true,
    });

    if (existing?.deletedAt) {
      await this.classCentreRepository.restore(existing.id);
      return existing;
    }
    await this.classCentreRepository.save({
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

  async deleteById(id: string): Promise<Class> {
    const entity = await this.classesRepository.findOne({
      relations: {
        classCentre: true,
      },
      where: {
        id,
      },
    });
    if (!entity) throw new NotFoundException();
    await this.classesRepository.softRemove(entity);
    return entity;
  }
}
