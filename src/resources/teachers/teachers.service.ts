import { DatabaseService } from "database/database.service";
import { plainToInstance } from "utils/transformer";
import { Querier } from "database/database.types";
import { TeacherEntity } from "entities/teacher.entities";
import { TeachersRepository } from "./teachers.repository";
import { UserEntity } from "entities/user.entities";
import { UsersRepository } from "resources/users/users.repository";
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
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

  async searchByIds(ids: Set<string>): Promise<TeacherEntity[]> {
    const teachers = await this.teachersRepository.searchByIds(ids);
    return teachers;
  }

  async get(): Promise<TeacherDto[]> {
    const teachers = await this.teachersRepository.get();
    const teacherDtos = teachers.map((teacher) => this.teacherToDto(teacher));
    return teacherDtos;
  }

  async getById(id: string): Promise<TeacherDto> {
    const entities = await this.teachersRepository.searchById(id);
    if (entities.length !== 1) throw new InternalServerErrorException();
    const teacher = entities[0];
    const teacherDto = this.teacherToDto(teacher);
    return teacherDto;
  }

  // TODO: Refactor to take in TeacherDatum and return TeacherEntity
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

  // TODO: Refactor to take TeacherDatum and return TeacherEntity
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
        user.identifier.id,
      );
      return {
        email,
        id: teacherId,
        name,
        staffId,
      };
    }

    const teacher = teachersWithStaffId[0];
    if (teacher.datum.email !== null)
      throw new BadRequestException("Teacher already exists.");
    if (teacher.datum.name !== name)
      throw new BadRequestException(
        "Teacher's recorded name does not match given name.",
      );

    await this.teachersRepository.insertTeacherUser(
      query,
      teacher.identifier.id,
      user.identifier.id,
    );
    return {
      email,
      id: teacher.identifier.id,
      name,
      staffId,
    };
  }

  async updateById(
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

  async deleteById(id: string): Promise<void> {
    await this.teachersRepository.deleteTeacherUserByTeacherId(id);
  }

  private teacherToDto(entity: TeacherEntity): TeacherDto {
    const plain = TeacherEntity.toObject(entity);
    return plainToInstance(TeacherDto, plain);
  }

  private async validateAll(teacherDtos: CreateTeacherDto[]) {
    const invalidTeachers = [];
    for (let index = 0; index < teacherDtos.length; index++) {
      const { email, name, staffId } = teacherDtos[index];
      const teachersWithStaffId =
        await this.teachersRepository.getIncludingDeletedByStaffId(staffId);
      if (teachersWithStaffId.length === 0) {
        const teachersWithEmail = await this.teachersRepository.searchByEmail(
          email,
        );
        if (teachersWithEmail.length > 0) {
          const teacherWithEmail = teachersWithEmail[0];
          invalidTeachers.push({
            index,
            message: `Email ${email} belongs to Teacher ${teacherWithEmail.datum.staffId}.`,
          });
        }
        continue;
      }

      const teacherWithStaffId = teachersWithStaffId[0];
      if (teacherWithStaffId.datum.email === null) continue;

      switch (true) {
        case teacherWithStaffId.datum.name !== name:
          invalidTeachers.push({
            index,
            message: `Teacher ${staffId} already exists as ${teacherWithStaffId.datum.name}.`,
          });
          break;
        case teacherWithStaffId.datum.email !== email:
          invalidTeachers.push({
            index,
            message: `Teacher ${staffId} has email ${teacherWithStaffId.datum.email}.`,
          });
          break;
        default:
          invalidTeachers.push({
            index,
            message: `Teacher ${staffId} ${teacherWithStaffId.datum.name} already exists.`,
          });
          break;
      }
    }

    return invalidTeachers;
  }
}
