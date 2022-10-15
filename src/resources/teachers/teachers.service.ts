import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateTeacherDto, UpdateTeacherDto } from "./dto/teachers.dto";
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
    data: CreateTeacherDto,
  ): Promise<CreateTeacherDto> {
    const newUser = await this.usersRepository.upsertByEmail({
      email: data.email,
      lastLoggedIn: new Date(),
    });

    const teacher = await this.teachersRepository.insert({
      email: data.email,
      staffId: data.staffId,
      name: data.name,
    });

    const teacherId = teacher.id;
    await this.teachersRepository.linkTeacherUser(
      newUser.id,
      createdBy,
      teacherId,
    );
    return this.teacherToDto(teacher);
  }

  async getTeachers(): Promise<CreateTeacherDto[]> {
    const teachers = await this.teachersRepository.getAll();
    return teachers.map((teacher) => this.teacherToDto(teacher));
  }

  async getTeacher(id: string): Promise<CreateTeacherDto> {
    const teacher = await this.teachersRepository.get(id);
    if (teacher) {
      return this.teacherToDto(teacher);
    } else {
      throw new BadRequestException();
    }
  }

  async updateTeacher(
    id: string,
    updated_by: string,
    data: UpdateTeacherDto,
  ): Promise<CreateTeacherDto> {
    const newTeacher: NewTeacher = {
      email: data.email,
      staffId: data.staffId,
      name: data.name,
    };
    const updatedTeacher = await this.teachersRepository.update(
      id,
      updated_by,
      newTeacher,
    );
    return this.teacherToDto(updatedTeacher);
  }

  async deleteTeacher(
    id: string,
    deletedBy: string,
  ): Promise<CreateTeacherDto> {
    const deletedTeacher = await this.teachersRepository.delete(id, deletedBy);
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
