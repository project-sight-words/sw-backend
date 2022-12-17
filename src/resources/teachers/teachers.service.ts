import { Injectable } from "@nestjs/common";
import { Teacher } from "entities/teacher.entities";
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

    const teacher = await this.teachersRepository.create({
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

  async get(): Promise<GetTeacherDto[]> {
    const teachers = await this.teachersRepository.get();
    return teachers.map((teacher) => this.teacherToDto(teacher));
  }

  async getByStaffId(staffId: string | null): Promise<GetTeacherDto> {
    const teacher = await this.teachersRepository.getByStaffId(staffId);
    return this.teacherToDto(teacher);
  }

  async updateByStaffId(
    staffId: string,
    updatedBy: string | null,
    data: UpdateTeacherDto,
  ): Promise<UpdateTeacherDto> {
    const updatedTeacher = await this.teachersRepository.updateByStaffId(
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

  async deleteByStaffId(
    staffId: string,
    deletedBy: string | null,
  ): Promise<DeleteTeacherDto> {
    const deletedTeacher = await this.teachersRepository.deleteByStaffId(
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
