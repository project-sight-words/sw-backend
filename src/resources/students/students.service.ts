import { Injectable, NotFoundException } from "@nestjs/common";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { NewStudent, Student } from "entities/student.entities";
import {
  CreateStudentDto,
  StudentDto,
  UpdateStudentDto,
} from "./dto/students.dto";
import { StudentsRepository } from "./students.repository";
import { UsersRepository } from "resources/users/users.repository";

@Injectable()
export class StudentsService {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async get(): Promise<StudentDto[]> {
    const students = await this.studentsRepository.get();
    return students.map((student) => this.studentToDto(student));
  }

  async getById(id: string): Promise<StudentDto> {
    const student = await this.studentsRepository.getById(id);

    // TODO: To raise this exception?
    if (!student) {
      throw new NotFoundException();
    }

    return this.studentToDto(student);
  }

  async create(studentDto: CreateStudentDto): Promise<StudentDto> {
    const user = await this.usersRepository.upsertByEmail({
      email: studentDto.email,
      lastLoggedIn: null,
    });

    const student = await this.studentsRepository.upsertByEmailAndStudentId(
      this.dtoToNewStudent(studentDto),
    );

    const linkedStudent = await this.studentsRepository.linkToUser(
      {
        userId: user.id,
        studentId: student.id,
      },
      student,
    );

    return this.studentToDto(linkedStudent);
  }

  async updateById(
    studentId: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<StudentDto> {
    const updatedStudent = await this.studentsRepository.update({
      name: updateStudentDto.name,
      studentId: studentId,
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
}
