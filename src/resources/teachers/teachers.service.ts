import { DatabaseService } from "database/database.service";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { Querier } from "database/database.types";
import { Teacher } from "entities/teacher.entities";
import { TeachersRepository } from "./teachers.repository";
import { UserEntity } from "entities/user.entities";
import { UsersRepository } from "resources/users/users.repository";
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
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

  private readonly loggerService = new Logger("TeachersService");

  async createMany(teacherDtos: CreateTeacherDto[]): Promise<TeacherDto[]> {
    const teachers = await this.databaseService.transaction(async (query) => {
      const createdTeachers = [];
      for (const teacherDto of teacherDtos) {
        try {
          const createdTeacher = await this.createOne(query, teacherDto);
          createdTeachers.push(createdTeacher);
        } catch (error) {
          this.loggerService.error(error);
          const validationMessages = await this.validateAll(teacherDtos);
          throw new BadRequestException(validationMessages);
        }
      }
      return createdTeachers;
    });
    return teachers;
  }

  async createOne(
    query: Querier,
    teacherDto: CreateTeacherDto,
  ): Promise<TeacherDto> {
    const { email, name, staffId } = teacherDto;

    const usersWithEmail = await this.usersRepository.getByEmail(email);
    let user: UserEntity;
    if (usersWithEmail.length > 0) {
      user = usersWithEmail[0];
    } else {
      user = await this.usersRepository.insert(query, {
        email,
        lastLoggedIn: null,
      });
    }

    const teachersWithStaffId =
      await this.teachersRepository.getIncludingDeletedByStaffId(staffId);

    if (teachersWithStaffId.length === 0) {
      const teacherId = await this.teachersRepository.insert(query, {
        name,
        staffId,
      });
      await this.teachersRepository.insertTeacherUser(
        query,
        teacherId,
        user.identitifier.id,
      );
      return {
        email,
        id: teacherId,
        name,
        staffId,
      };
    }

    const teacher = teachersWithStaffId[0];
    if (teacher.email !== null)
      throw new BadRequestException("Teacher already exists.");
    if (teacher.name !== name)
      throw new BadRequestException(
        "Teacher's recorded name does not match given name.",
      );

    await this.teachersRepository.insertTeacherUser(
      query,
      teacher.id,
      user.identitifier.id,
    );
    return {
      email,
      id: teacher.id,
      name,
      staffId,
    };
  }

  async get(): Promise<TeacherDto[]> {
    const teachers = await this.teachersRepository.get();
    const teacherDtos = teachers.map((teacher) => this.teacherToDto(teacher));
    return teacherDtos;
  }

  async getById(id: string): Promise<TeacherDto> {
    const teachers = await this.teachersRepository.getById(id);
    if (teachers.length === 0) throw new NotFoundException();
    const teacher = teachers[0];
    const teacherDto = this.teacherToDto(teacher);
    return teacherDto;
  }

  async updateByTeacherId(
    id: string,
    updateTeacherDto: UpdateTeacherDto,
  ): Promise<TeacherDto> {
    const updatedTeacher = await this.teachersRepository.updateById(
      id,
      updateTeacherDto,
    );
    const teacherDto = this.teacherToDto(updatedTeacher);
    return teacherDto;
  }

  async deleteById(id: string): Promise<TeacherDto> {
    const deletedTeacher = await this.teachersRepository.deleteById(id);
    const teacherDto = this.teacherToDto(deletedTeacher);
    return teacherDto;
  }

  private teacherToDto(teacher: Teacher): TeacherDto {
    return plainToInstance(TeacherDto, instanceToPlain(teacher));
  }

  private async validateAll(teacherDtos: CreateTeacherDto[]) {
    const invalidTeachers = [];
    for (let index = 0; index < teacherDtos.length; index++) {
      const { email, name, staffId } = teacherDtos[index];
      const teachersWithStaffId =
        await this.teachersRepository.getIncludingDeletedByStaffId(staffId);
      if (teachersWithStaffId.length === 0) {
        const teachersWithEmail = await this.teachersRepository.getByEmail(
          email,
        );
        if (teachersWithEmail.length > 0) {
          const teacherWithEmail = teachersWithEmail[0];
          invalidTeachers.push({
            index,
            message: `Email ${email} belongs to Teacher ${teacherWithEmail.staffId}.`,
          });
        }
        continue;
      }

      const teacherWithStaffId = teachersWithStaffId[0];
      if (teacherWithStaffId.email === null) continue;

      switch (true) {
        case teacherWithStaffId.name !== name:
          invalidTeachers.push({
            index,
            message: `Teacher ${staffId} already exists as ${teacherWithStaffId.name}.`,
          });
          break;
        case teacherWithStaffId.email !== email:
          invalidTeachers.push({
            index,
            message: `Teacher ${staffId} has email ${teacherWithStaffId.email}.`,
          });
          break;
        default:
          invalidTeachers.push({
            index,
            message: `Teacher ${staffId} ${teacherWithStaffId.name} already exists.`,
          });
          break;
      }
    }

    return invalidTeachers;
  }
}
