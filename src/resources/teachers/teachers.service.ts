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

    const newTeacher: NewTeacher = {
      staffId: teacherData.staffId,
      name: teacherData.name,
    };
    return await this.teachersRepository.insertTeacher(
      linkUserTeacher.id,
      created_by,
      newTeacher,
    );
  }

  async getTeachers(): Promise<Teacher[]> {
    return await this.teachersRepository.getTeachers();
  }

  async getTeacher(id: string): Promise<Teacher> {
    return await this.teachersRepository.getTeacher(id);
  }

  async updateTeacher(
    updated_by: string,
    teacherData: CreateTeacherDto,
  ): Promise<Teacher> {
    const newTeacher: NewTeacher = {
      staffId: teacherData.staffId,
      name: teacherData.name,
    };
    return await this.teachersRepository.updateTeacher(updated_by, newTeacher);
  }

  async deleteTeacher(id: string, deleted_by: string): Promise<Teacher> {
    return await this.teachersRepository.deleteTeacher(id, deleted_by);
  }
}
