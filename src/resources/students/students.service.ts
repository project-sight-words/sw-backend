import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { NewStudent, Student } from "../../entities/student.entities";
import { UsersRepository } from "../users/users.repository";
import { StudentDto, UpdateStudentDto } from "./dto/students.dto";
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
    const student = await this.studentsRepository.getById(id);
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

  async updateStudent(
    studentId: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<StudentDto> {
    const updatedStudent = await this.studentsRepository.updateStudent({
      name: updateStudentDto.name,
      studentId: studentId,
      email: "",
    });

    if (!updatedStudent) throw new BadRequestException();

    return this.studentToDto(updatedStudent);
  }

  private studentToDto(student: Student): StudentDto {
    return plainToInstance(StudentDto, instanceToPlain(student));
  }

  private dtoToNewStudent(studentDto: StudentDto): NewStudent {
    return plainToInstance(NewStudent, instanceToPlain(studentDto));
  }
}
