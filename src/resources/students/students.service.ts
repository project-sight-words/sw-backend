import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { NewStudent, NewStudentUser, Student } from "entities/student.entities";
import { UsersRepository } from "resources/users/users.repository";
import { DatabaseService } from "../../database/database.service";
import {
  CreateStudentDto,
  StudentDto,
  UpdateStudentDto,
} from "./dto/students.dto";
import { StudentsRepository } from "./students.repository";

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

  async getById(id: string, isUUID: boolean) {
    const student = await this.studentsRepository.getById(id, isUUID);

    // TODO: To raise this exception?
    if (!student) {
      throw new NotFoundException();
    }

    return this.studentToDto(student);
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

    let student = await this.studentsRepository.getById(
      studentDto.studentId,
      false,
    );

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

  async createStudents(studentDtos: CreateStudentDto[]): Promise<StudentDto[]> {
    return await this.databaseService.transaction(async (_) => {
      const createdStudents = [];
      for (const studentDto of studentDtos) {
        createdStudents.push(await this.createStudent(studentDto));
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

  // TODO: run this to check for the following cases:
  // 1. cannot have the same student_id attached to the same user_id
  // async validateStudentsArray(arr: CreateStudentDto[]) {}
}
