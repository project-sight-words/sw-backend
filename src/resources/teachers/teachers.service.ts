import { Injectable } from "@nestjs/common";
import { CreateTeacherDto } from "./dto/create.dto";
import { TeachersEntity } from "src/entities/teacher.entities";
import { TeachersRepository } from "./teachers.repository";

@Injectable()
export class TeachersService {
  constructor(private teachersRepository: TeachersRepository) {}

  createTeacher(teacherData: CreateTeacherDto): Promise<TeachersEntity> {
    // returns nothing
    const teachersEntity = TeachersEntity.createTeacher(
      teacherData.staff_id,
      teacherData.name,
    );
    return this.teachersRepository.insertTeacher(teachersEntity);
  }

  getTeachers(): string {
    // return an array of teacher object
    // return selectAllTeachers();
    return "Get all teachers";
  }

  getTeacher(id: number): Promise<TeachersEntity> {
    // return a teacher object
    return this.teachersRepository.getTeacher(id);
    // return "Get Single Teacher";
  }

  updateTeacher(id: number, staff_id: string, name: string): void {
    //dunnid return anyth
    // return changeTeacher(id);
  }

  deleteTeacher(id: number): void {
    //dunnid return anything
    // return removeTeacher( id);
  }
}
