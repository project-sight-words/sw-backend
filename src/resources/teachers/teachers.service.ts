import { BadRequestException, Injectable } from "@nestjs/common";
import { NewTeacher, Teacher } from "entities/teacher.entities";
import { TeachersRepository } from "./teachers.repository";
import { UsersRepository } from "resources/users/users.repository";
import {
  CreateTeacherDto,
  DeleteTeacherDto,
  GetTeacherDto,
  UpdateTeacherDto,
} from "./dto/teachers.dto";

@Injectable()
export class TeachersService {
  constructor(
    private readonly teachersRepository: TeachersRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(
    createdBy: string | null,
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

  async getAll(): Promise<GetTeacherDto[]> {
    const teachers = await this.teachersRepository.getAll();
    return teachers.map((teacher) => this.teacherToDto(teacher));
  }

  async get(staffId: string | null): Promise<GetTeacherDto> {
    const teacher = await this.teachersRepository.get(staffId);
    if (teacher) {
      return this.teacherToDto(teacher);
    } else {
      throw new BadRequestException();
    }
  }

  async update(
    staffId: string,
    updatedBy: string | null,
    data: UpdateTeacherDto,
  ): Promise<UpdateTeacherDto> {
    const updatedTeacher = await this.teachersRepository.update(
      staffId,
      updatedBy,
      {
        email: data.email,
        staffId: data.staffId,
        name: data.name,
      },
    );
    return this.teacherToDto(updatedTeacher);
  }

  async delete(
    staffId: string,
    deletedBy: string | null,
  ): Promise<DeleteTeacherDto> {
    const deletedTeacher = await this.teachersRepository.delete(
      staffId,
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
