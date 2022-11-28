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

  async getById(id: string): Promise<StudentDto> {
    const student = await this.studentsRepository.getById(id);

    // TODO: To raise this exception?
    if (!student) {
      throw new NotFoundException();
    }

    return this.studentToDto(student);
  }

  async create(studentDto: CreateStudentDto): Promise<StudentDto> {
    return await this.databaseService.transaction(async (_) => {
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
