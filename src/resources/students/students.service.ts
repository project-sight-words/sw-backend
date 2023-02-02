import { DatabaseService } from "database/database.service";
import { plainToInstance } from "utils/transformer";
import { Querier } from "database/database.types";
import { StudentEntity } from "entities/student.entities";
import { StudentsRepository } from "./students.repository";
import { UserEntity } from "entities/user.entities";
import { UsersRepository } from "resources/users/users.repository";
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import {
  CreateStudentDto,
  StudentDto,
  UpdateStudentDto,
} from "./dto/students.dto";

@Injectable()
export class StudentsService {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly databaseService: DatabaseService,
  ) {}

  private readonly loggerService = new Logger("StudentsService");

  async get(): Promise<StudentDto[]> {
    const students = await this.studentsRepository.get();
    const studentDtos = students.map((student) => this.studentToDto(student));
    return studentDtos;
  }

  async getById(id: string): Promise<StudentDto> {
    const students = await this.studentsRepository.searchById(id);
    if (students.length === 0) throw new NotFoundException();
    const student = students[0];
    const studentDto = this.studentToDto(student);
    return studentDto;
  }

  async searchByIds(ids: Set<string>): Promise<StudentEntity[]> {
    const students = await this.studentsRepository.searchByIds(ids);
    return students;
  }

  // TODO: Refactor to take in StudentDatum and return StudentEntity
  async createMany(studentDtos: CreateStudentDto[]): Promise<StudentDto[]> {
    const students = await this.databaseService.transaction(async (query) => {
      const createdStudents = [];
      for (const studentDto of studentDtos) {
        try {
          const createdStudent = await this.createOne(query, studentDto);
          createdStudents.push(createdStudent);
        } catch (error: unknown) {
          this.loggerService.error(error);
          const validationMessages = await this.validateAll(studentDtos);
          throw new BadRequestException(validationMessages);
        }
      }
      return createdStudents;
    });
    return students;
  }

  // TODO: Refactor to take in StudentDatum and return StudentEntity
  private async createOne(
    query: Querier,
    studentDto: CreateStudentDto,
  ): Promise<StudentDto> {
    const { email, name, studentId } = studentDto;

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

    const studentsWithStudentId =
      await this.studentsRepository.getIncludingDeletedByStudentId(studentId);

    if (studentsWithStudentId.length === 0) {
      const studentUuid = await this.studentsRepository.insert(query, {
        name,
        studentId,
      });
      await this.studentsRepository.insertStudentUser(
        query,
        studentUuid,
        user.identifier.id,
      );
      return {
        email,
        id: studentUuid,
        name,
        studentId,
      };
    }

    const student = studentsWithStudentId[0];
    if (student.datum.email !== null)
      throw new BadRequestException("Student already exists.");
    if (student.datum.name !== name)
      throw new BadRequestException(
        "Student's recorded name does not match given name.",
      );
    await this.studentsRepository.insertStudentUser(
      query,
      student.identifier.id,
      user.identifier.id,
    );
    return {
      email,
      id: student.identifier.id,
      name,
      studentId,
    };
  }

  async updateById(
    uuid: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<StudentDto> {
    const student = await this.studentsRepository.updateById(uuid, {
      name: updateStudentDto.name,
      studentId: updateStudentDto.studentId,
    });
    const studentDto = this.studentToDto(student);
    return studentDto;
  }

  async deleteById(uuid: string): Promise<void> {
    await this.studentsRepository.deleteStudentUserByStudentId(uuid);
  }

  private studentToDto(entity: StudentEntity): StudentDto {
    const plain = StudentEntity.toObject(entity);
    return plainToInstance(StudentDto, plain);
  }

  private async validateAll(studentDtos: CreateStudentDto[]) {
    const invalidStudents = [];
    for (let index = 0; index < studentDtos.length; index++) {
      const { email, name, studentId } = studentDtos[index];
      const studentsWithStudentId =
        await this.studentsRepository.getIncludingDeletedByStudentId(studentId);
      if (studentsWithStudentId.length === 0) {
        const studentsWithEmail = await this.studentsRepository.searchByEmail(
          email,
        );
        if (studentsWithEmail.length > 0) {
          const studentWithEmail = studentsWithEmail[0];
          const {
            datum: { studentId },
          } = studentWithEmail;
          invalidStudents.push({
            index,
            message: `Email ${email} belongs to Student ${studentId}.`,
          });
        }
        continue;
      }

      const studentWithStudentId = studentsWithStudentId[0];
      if (studentWithStudentId.datum.email === null) continue;

      switch (true) {
        case studentWithStudentId.datum.name !== name:
          invalidStudents.push({
            index,
            message: `Student ${studentId} already exists as ${studentWithStudentId.datum.name}.`,
          });
          break;
        case studentWithStudentId.datum.email !== email:
          invalidStudents.push({
            index,
            message: `Student ${studentId} has email ${studentWithStudentId.datum.email}.`,
          });
          break;
        default:
          invalidStudents.push({
            index,
            message: `Student ${studentId} ${studentWithStudentId.datum.email} already exists.`,
          });
          break;
      }
    }

    return invalidStudents;
  }
}
