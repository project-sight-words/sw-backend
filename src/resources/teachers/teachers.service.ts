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
    return this.teacherToCreateDto(teacher);
  }

  async get(): Promise<GetTeacherDto[]> {
    const teachers = await this.teachersRepository.get();
    return teachers.map((teacher) => this.teacherToGetDto(teacher));
  }

  async getByTeacherId(teacherId: string | null): Promise<GetTeacherDto> {
    const teacher = await this.teachersRepository.getByTeacherId(teacherId);
    return this.teacherToGetDto(teacher);
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
    return this.teacherToUpdateDto(updatedTeacher);
  }

  async deleteByStaffId(
    staffId: string,
    deletedBy: string | null,
  ): Promise<DeleteTeacherDto> {
    const deletedTeacher = await this.teachersRepository.deleteByStaffId(
      staffId,
      deletedBy,
    );
    return this.teacherToCreateDto(deletedTeacher);
  }

  private teacherToCreateDto(teacher: Teacher): CreateTeacherDto {
    return {
      id: teacher.id,
      email: teacher.email,
      staffId: teacher.staffId,
      name: teacher.name,
    };
  }

  private teacherToGetDto(teacher: Teacher): GetTeacherDto {
    return {
      id: teacher.id,
      email: teacher.email,
      staffId: teacher.staffId,
      name: teacher.name,
    };
  }

  private teacherToUpdateDto(teacher: Teacher): UpdateTeacherDto {
    return {
      id: teacher.id,
      email: teacher.email,
      staffId: teacher.staffId,
      name: teacher.name,
    };
  }
}
