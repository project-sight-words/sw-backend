import { Injectable } from "@nestjs/common";
import { CreateTeacherDto } from "./dto/teachers.dto";
import { NewTeacher, Teacher } from "entities/teacher.entities";
import { TeachersRepository } from "./teachers.repository";
import { UsersRepository } from "resources/users/users.repository";
import { NewUser } from "entities/user.entities";

@Injectable()
export class TeachersService {
  constructor(
    private readonly teachersRepository: TeachersRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async createTeacher(
    created_by: string,
    teacherData: CreateTeacherDto,
  ): Promise<Teacher> {
    const userData: NewUser = {
      email: teacherData.email,
      lastLoggedIn: new Date(),
    };
    const linkUserTeacher = await this.usersRepository.upsertByEmail(userData);

    const data: NewTeacher = {
      staffId: teacherData.staffId,
      name: CreateTeacherDto.name,
    };
    return await this.teachersRepository.insertTeacher(
      linkUserTeacher.id,
      created_by,
      data,
    );
  }

  async getTeachers(): Promise<Teacher[]> {
    return await this.teachersRepository.getTeachers();
  }

  getTeacher(id: string): Promise<Teacher> {
    return this.teachersRepository.getTeacher(id);
  }

  // updateTeacher(id: number, staff_id: string, name: string): void {
  // dunnid return anyth
  // return changeTeacher(id);
  // }

  // deleteTeacher(id: number): void {
  //dunnid return anything
  // return removeTeacher( id);
  // }
}
