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
    class_id: string,
    teacher_id: string,
    is_form_teacher: boolean,
  ) {
    return this.classesRepository.addTeacherToClass(
      class_id,
      teacher_id,
      is_form_teacher,
    );
  }

  async getTeachersFromClass(class_id: string) {
    return this.classesRepository.getTeachersFromClass(class_id);
  }

  async removeTeacherFromClass(class_id: string, teacher_id: string) {
    return this.classesRepository.removeTeacherFromClass(class_id, teacher_id);
  }

  async addStudentToClass(class_id: string, student_id: string) {
    return this.classesRepository.addStudentToClass(class_id, student_id);
  }

  async getStudentsFromClass(class_id: string) {
    return this.classesRepository.getStudentsFromClass(class_id);
  }

  async removeStudentFromClass(class_id: string, student_id: string) {
    return this.classesRepository.removeStudentFromClass(class_id, student_id);
  }
}
