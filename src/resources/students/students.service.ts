import { DatabaseService } from "database/database.service";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { NewStudent, Student } from "entities/student.entities";
import { Querier } from "database/database.types";
import { StudentsRepository } from "./students.repository";
import { User } from "entities/user.entities";
import { UsersRepository } from "resources/users/users.repository";
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
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

  async getById(id: string) {
    const students = await this.studentsRepository.getById(id);
    if (students.length === 0) throw new NotFoundException();
    const student = students[0];
    const studentDto = this.studentToDto(student);
    return studentDto;
  }

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

  async updateById(
    uuid: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<StudentDto> {
    const student = await this.studentsRepository.update(uuid, {
      name: updateStudentDto.name,
      studentId: updateStudentDto.studentId,
    });
    const studentDto = this.studentToDto(student);
    return studentDto;
  }

  private studentToDto(student: Student): StudentDto {
    return plainToInstance(StudentDto, instanceToPlain(student));
  }

  private dtoToNewStudent(studentDto: CreateStudentDto): NewStudent {
    return plainToInstance(NewStudent, instanceToPlain(studentDto));
  }

  private async validateAll(studentDtos: CreateStudentDto[]) {
    const invalidStudents = [];
    for (let index = 0; index < studentDtos.length; index++) {
      const { email, name, studentId } = studentDtos[index];
      const studentsWithStudentId =
        await this.studentsRepository.getIncludingDeletedByStudentId(studentId);
      if (studentsWithStudentId.length === 0) {
        const studentsWithEmail = await this.studentsRepository.getByEmail(
          email,
        );
        if (studentsWithEmail.length > 0) {
          const studentWithEmail = studentsWithEmail[0];
          invalidStudents.push({
            index,
            message: `Email ${email} belongs to Student ${studentWithEmail.studentId}.`,
          });
        }
        continue;
      }

      const studentWithStudentId = studentsWithStudentId[0];
      if (studentWithStudentId.email === null)
        throw new InternalServerErrorException();

      switch (true) {
        case studentWithStudentId.name !== name:
          invalidStudents.push({
            index,
            message: `Student ${studentId} ${studentWithStudentId.name} exists.`,
          });
          break;
        case studentWithStudentId.email !== email:
          invalidStudents.push({
            index,
            message: `Student ${studentId} has email ${studentWithStudentId.email}.`,
          });
          break;
      }
    }

    return invalidStudents;
  }

  private async createOne(
    query: Querier,
    studentDto: CreateStudentDto,
  ): Promise<StudentDto> {
    const { email, name, studentId } = studentDto;

    const usersWithEmail = await this.usersRepository.getByEmail(email);
    let user: User;
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
        user.id,
      );
      return {
        email,
        id: studentUuid,
        name,
        studentId,
      };
    }

    const student = studentsWithStudentId[0];
    if (student.email !== null)
      throw new BadRequestException("Student already exists.");
    if (student.name !== name)
      throw new BadRequestException(
        "Student's recorded name does not match given name.",
      );
    await this.studentsRepository.insertStudentUser(query, student.id, user.id);
    return {
      email,
      id: student.id,
      name,
      studentId,
    };
  }
}
