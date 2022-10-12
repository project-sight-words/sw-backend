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
    createdBy: string,
    teacherData: CreateTeacherDto,
  ): Promise<CreateTeacherDto> {
    const userData: NewUser = {
      email: teacherData.email,
      lastLoggedIn: new Date(),
    };
    const newUser = await this.usersRepository.upsertByEmail(userData);
    console.log(newUser);
    const newTeacher: NewTeacher = {
      email: teacherData.email,
      staffId: teacherData.staffId,
      name: teacherData.name,
    };
    const teacher = await this.teachersRepository.insertTeacher(
      newUser.id,
      createdBy,
      newTeacher,
    );
    return this.teacherToDto(teacher);
  }

  async getTeachers(): Promise<CreateTeacherDto[]> {
    const teacherArr = await this.teachersRepository.getTeachers();
    return teacherArr.map((teacher) => this.teacherToDto(teacher));
  }

  async getTeacher(id: string): Promise<CreateTeacherDto> {
    const teacher = await this.teachersRepository.getTeacher(id);
    if (teacher) {
      return this.teacherToDto(teacher);
    } else {
      return {
        email: "",
        staffId: "",
        name: "",
      };
    }
  }

  async updateTeacher(
    updated_by: string,
    teacherData: CreateTeacherDto,
  ): Promise<CreateTeacherDto> {
    const newTeacher: NewTeacher = {
      email: teacherData.email,
      staffId: teacherData.staffId,
      name: teacherData.name,
    };
    const updatedTeacher = await this.teachersRepository.updateTeacher(
      updated_by,
      newTeacher,
    );
    return this.teacherToDto(updatedTeacher);
  }

  async deleteTeacher(
    id: string,
    deletedBy: string,
  ): Promise<CreateTeacherDto> {
    const deletedTeacher = await this.teachersRepository.deleteTeacher(
      id,
      deletedBy,
    );
    return this.teacherToDto(deletedTeacher);
  }

  private teacherToDto(teacher: Teacher): CreateTeacherDto {
    return {
      email: teacher.email,
      staffId: teacher.staffId,
      name: teacher.name,
    };
  }
}
