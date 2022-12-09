import { BadRequestException, Injectable } from "@nestjs/common";
import { NewTeacherUser, Teacher } from "entities/teacher.entities";
import { TeachersRepository } from "./teachers.repository";
import { UsersRepository } from "resources/users/users.repository";
import { DatabaseService } from "../../database/database.service";
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
    private readonly databaseService: DatabaseService,
  ) {}

  async bulkCreate(
    createdBy: string | null,
    data: CreateTeacherDto[],
  ): Promise<TeacherDto[]> {
    console.log(data);
    const teachersDto = await this.databaseService.transaction(async (_) => {
      const createdTeachers = [];
      for (const teacherDto of data) {
        try {
          createdTeachers.push(await this.create(createdBy, teacherDto));
        } catch (e) {
          throw new BadRequestException(await this.validateAll(data));
        }
      }
      return createdTeachers;
    });
    return teachersDto;
  }

  async create(
    createdBy: string | null,
    data: CreateTeacherDto,
  ): Promise<TeacherDto> {
    let newUser = await this.usersRepository.getByEmail(data.email);

    if (!newUser) {
      newUser = await this.usersRepository.upsertByEmail({
        email: data.email,
        lastLoggedIn: new Date(),
      });
    }
    let teacher = await this.teachersRepository.getByTeacherId(data.staffId);

    if (!teacher) {
      teacher = await this.teachersRepository.create({
        email: data.email,
        staffId: data.staffId,
        name: data.name,
      });
    } else {
      if (teacher.name != data.name) {
        throw new BadRequestException("Teacher's recorded name does not match");
      }
    }

    const teacherId = teacher.id;

    const teacherUser: NewTeacherUser = {
      userId: newUser.id,
      teacherId: teacherId,
    };

    const isLinked = await this.teachersRepository.isLinked(teacherUser);

    if (!isLinked) {
      await this.teachersRepository.linkTeacherUser(
        newUser.id,
        createdBy,
        teacherId,
      );
    }
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

  private async validateAll(data: CreateTeacherDto[]) {
    const invalidTeachers = [];
    for (const teacherDto of data) {
      const teacher = await this.teachersRepository.getByTeacherId(
        teacherDto.staffId,
      );

      if (teacher.name !== teacherDto.name) {
        invalidTeachers.push(
          `Attempted Insert ${teacherDto.name} conflicts with ${teacher.name}`,
        );
      }
    }
    return invalidTeachers;
  }
}
