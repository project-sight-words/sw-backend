import { DatabaseService } from "../../database/database.service";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { NewStudent, NewStudentUser, Student } from "entities/student.entities";
import { StudentsRepository } from "./students.repository";
import { UsersRepository } from "resources/users/users.repository";
import {
  BadRequestException,
  Injectable,
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

  async get(): Promise<StudentDto[]> {
    const students = await this.studentsRepository.get();
    return students.map((student) => this.studentToDto(student));
  }

  async getById(id: string) {
    const student = await this.studentsRepository.getById(id);

    if (!student) throw new NotFoundException();

    return this.studentToDto(student);
  }

  async createStudents(studentDtos: CreateStudentDto[]): Promise<StudentDto[]> {
    return await this.databaseService.transaction(async (_) => {
      const createdStudents = [];
      for (const studentDto of studentDtos) {
        try {
          createdStudents.push(await this.createStudent(studentDto));
        } catch (e) {
          // If an error occurs (which only happens if the given student's name does not match the original student's name in the database)
          // Proceed with validating everything else
          throw new BadRequestException(await this.validateAll(studentDtos));
        }
      }

      return createdStudents;
    });
  }

  async updateById(
    studentUUID: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<StudentDto> {
    const updatedStudent = await this.studentsRepository.update(studentUUID, {
      name: updateStudentDto.name,
      studentId: updateStudentDto.studentId,
      email: "",
    });

    return this.studentToDto(updatedStudent);
  }

  private studentToDto(student: Student): StudentDto {
    return plainToInstance(StudentDto, instanceToPlain(student));
  }

  private dtoToNewStudent(studentDto: CreateStudentDto): NewStudent {
    return plainToInstance(NewStudent, instanceToPlain(studentDto));
  }

  private async validateAll(studentDtos: CreateStudentDto[]) {
    const invalidStudents = [];

    for (let i = 0; i < studentDtos.length; i++) {
      const studentDto = studentDtos[i];

      const student = await this.studentsRepository.getById(
        studentDto.studentId,
      );

      if (!student) continue;

      if (student.name !== studentDto.name) {
        invalidStudents.push(
          `Attempted insert ${
            studentDto.name
          } conflicts with existing student's name ${student.name} at row ${
            i + 1
          }`,
        );
      }
    }

    return invalidStudents;
  }

  private async createStudent(
    studentDto: CreateStudentDto,
  ): Promise<StudentDto> {
    let user = await this.usersRepository.getByEmail(studentDto.email);

    if (!user) {
      user = await this.usersRepository.insertByEmail({
        email: studentDto.email,
        lastLoggedIn: null,
      });
    }

    let student = await this.studentsRepository.getById(studentDto.studentId);

    if (!student) {
      student = await this.studentsRepository.upsertByStudentId(
        this.dtoToNewStudent(studentDto),
      );
    } else {
      if (student.name !== studentDto.name) {
        throw new BadRequestException(
          "Student's recorded name does not match given name.",
        );
      }
    }

    const studentUser: NewStudentUser = {
      userId: user.id,
      studentId: student.id,
    };

    const isLinked = await this.studentsRepository.isLinked(studentUser);
    let linkedStudent = student;

    if (!isLinked) {
      linkedStudent = await this.studentsRepository.linkToUser(
        studentUser,
        student,
      );
    }

    return this.studentToDto(linkedStudent);
  }
}
