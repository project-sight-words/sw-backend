import { Injectable, Param } from "@nestjs/common";
import { UpdateClassDto } from "./dto/classes.dto";
import { ClassesRepository } from "./classes.repository";

@Injectable()
export class ClassesService {
  constructor(private classesRepository: ClassesRepository) {}

  async create(createClassDto: UpdateClassDto) {
    return this.classesRepository.createClass(createClassDto);
  }

  async findAll() {
    return this.classesRepository.findAll();
  }

  async findOne(id: string) {
    return this.classesRepository.findOne(id);
  }

  async update(@Param("id") id: string, updateClassDto: UpdateClassDto) {
    return this.classesRepository.updateClass(id, updateClassDto);
  }

  async remove(@Param("id") id: string) {
    return this.classesRepository.remove(id);
  }

  async addTeacherToClass(
    classId: string,
    teacherId: string,
    isFormTeacher: boolean,
  ) {
    return this.classesRepository.addTeacherToClass(
      classId,
      teacherId,
      isFormTeacher,
    );
  }

  async getTeachersFromClass(classId: string) {
    return this.classesRepository.getTeachersFromClass(classId);
  }

  async removeTeacherFromClass(classId: string, teacherId: string) {
    return this.classesRepository.removeTeacherFromClass(classId, teacherId);
  }

  async addStudentToClass(classId: string, studentId: string) {
    return this.classesRepository.addStudentToClass(classId, studentId);
  }

  async getStudentsFromClass(classId: string) {
    return this.classesRepository.getStudentsFromClass(classId);
  }

  async removeStudentFromClass(classId: string, studentId: string) {
    return this.classesRepository.removeStudentFromClass(classId, studentId);
  }
}
