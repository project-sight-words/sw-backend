import { Injectable, NotFoundException } from "@nestjs/common";
import { NewStudent, Student } from "../../entities/student.entities";
import { UsersRepository } from "../users/users.repository";
import { StudentDto } from "./students.dto";
import { StudentsRepository } from "./students.repository";

@Injectable()
export class StudentsService {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async getStudents(): Promise<StudentDto[]> {
    const students = await this.studentsRepository.getAllStudents();
    return students.map((student) => this.studentToDto(student));
  }

  async getStudentById(id: string): Promise<StudentDto> {
    const student = await this.studentsRepository.getStudentById(id);
    if (!student) throw new NotFoundException();
    return this.studentToDto(student);
  }

  async createStudent(studentDto: StudentDto): Promise<StudentDto> {
    const newUser = await this.usersRepository.upsertByEmail({
      email: studentDto.email,
      lastLoggedIn: null,
    });

    const newStudent = await this.studentsRepository.upsertByEmailAndStudentId(
      this.dtoToNewStudent(studentDto),
    );

    const linkedStudent = await this.studentsRepository.linkStudentToUser(
      {
        userId: newUser.id,
        studentId: newStudent.id,
      },
      newStudent,
    );

    return this.studentToDto(linkedStudent);
  }

  async updateStudent(studentDto: StudentDto): Promise<StudentDto> {
    const updatedStudent = await this.studentsRepository.updateStudent(
      this.dtoToNewStudent(studentDto),
    );
    return this.studentToDto(updatedStudent);
  }

  private studentToDto(student: Student): StudentDto {
    return {
      email: student.email,
      studentId: student.studentId,
      name: student.name,
    };
  }

  private dtoToNewStudent(studentDto: StudentDto): NewStudent {
    return {
      email: studentDto.email,
      studentId: studentDto.studentId,
      name: studentDto.name,
    };
  }
}
