import { Injectable } from "@nestjs/common";
import { Teacher } from "entities/teacher.entities";
import { TeachersRepository } from "./teachers.repository";
import { UsersRepository } from "resources/users/users.repository";
import {
  CreateTeacherDto,
  TeacherDto,
  UpdateTeacherDto,
} from "./dto/teachers.dto";
@Injectable()
export class TeachersService {
  constructor(
    private readonly teachersRepository: TeachersRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async bulkCreate(
    createdBy: string | null,
    data: CreateTeacherDto[],
  ): Promise<CreateTeacherDto[]> {
    console.log(data);
    const dataArr = await Promise.all(
      data.map(async (teacher) => this.create(createdBy, teacher)),
    );
    return dataArr;
  }

  async create(
    createdBy: string | null,
    data: CreateTeacherDto,
  ): Promise<CreateTeacherDto> {
    const newUser = await this.usersRepository.upsertByEmail({
      email: data.email,
      lastLoggedIn: new Date(),
    });
    console.log(newUser.id);
    const teacher = await this.teachersRepository.create({
      email: data.email,
      staffId: data.staffId,
      name: data.name,
    });
    console.log(teacher.id);
    const teacherId = teacher.id;
    await this.teachersRepository.linkTeacherUser(
      newUser.id,
      createdBy,
      teacherId,
    );
    return this.teacherToDto(teacher);
  }

  async get(): Promise<TeacherDto[]> {
    const teachers = await this.teachersRepository.get();
    return teachers.map((teacher) => this.teacherToDto(teacher));
  }

  async getByTeacherId(teacherId: string | null): Promise<TeacherDto> {
    const teacher = await this.teachersRepository.getByTeacherId(teacherId);
    return this.teacherToDto(teacher);
  }

  async updateByTeacherId(
    staffId: string,
    updatedBy: string | null,
    data: UpdateTeacherDto,
  ): Promise<TeacherDto> {
    const updatedTeacher = await this.teachersRepository.updateByTeacherId(
      staffId,
      updatedBy,
      {
        staffId: data.staffId,
        name: data.name,
      },
    );
    return this.teacherToDto(updatedTeacher);
  }

  async deleteByTeacherId(
    staffId: string,
    deletedBy: string | null,
  ): Promise<TeacherDto> {
    const deletedTeacher = await this.teachersRepository.deleteByTeacherId(
      staffId,
      deletedBy,
    );
    return this.teacherToDto(deletedTeacher);
  }

  private teacherToDto(teacher: Teacher): TeacherDto {
    return {
      id: teacher.id,
      email: teacher.email,
      staffId: teacher.staffId,
      name: teacher.name,
    };
  }
}
