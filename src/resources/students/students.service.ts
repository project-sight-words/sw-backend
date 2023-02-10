import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DatabaseService } from "database/database.service";
import { Student, StudentEntity, StudentUser } from "entities/student.entities";
import { UsersRepository } from "resources/users/users.repository";
import { DataSource, In, IsNull, Repository } from "typeorm";
import { plainToInstance } from "utils/transformer";
import { UsersService } from "../users/users.service";
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
    private readonly usersService: UsersService,
    private readonly databaseService: DatabaseService,
    private readonly dataSource: DataSource,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(StudentUser)
    private readonly studentUserRepository: Repository<StudentUser>,
  ) {}

  private readonly loggerService = new Logger("StudentsService");

  async searchByIds(ids: Set<string>): Promise<StudentEntity[]> {
    const students = await this.studentsRepository.searchByIds(ids);
    return students;
  }

  async get(): Promise<StudentDto[]> {
    const students = await this.studentsRepository.get();
    const studentDtos = students.map((student) => this.studentToDto(student));
    return studentDtos;
  }

  async getById(id: string): Promise<StudentDto> {
    const entities = await this.studentsRepository.searchById(id);
    if (entities.length !== 1) throw new InternalServerErrorException();
    const student = entities[0];
    const studentDto = this.studentToDto(student);
    return studentDto;
  }

  async createMany(studentDtos: CreateStudentDto[]): Promise<StudentDto[]> {
    const errorMessages = await this.validateAll(studentDtos);
    if (errorMessages.length !== 0)
      throw new BadRequestException(errorMessages);

    // TODO: Transaction this
    // Guaranteed that all entries are valid so bulk insert can ignore any repetitions
    await this.usersService.createManyIfNotExists(
      studentDtos.map(({ email }) => email),
    );
    await this.studentRepository
      .createQueryBuilder()
      .insert()
      .values(studentDtos.map(({ name, studentId }) => ({ name, studentId })))
      .orIgnore()
      .execute();

    // Retrieve all users and students
    const allUsers = await this.usersService.findByEmails(
      studentDtos.map(({ email }) => email),
    );
    const allStudents = await this.studentRepository.find({
      where: {
        studentId: In(studentDtos.map(({ studentId }) => studentId)),
      },
    });

    const userIds: Record<string, string> = {};
    const studentIds: Record<string, string> = {};
    for (let i = 0; i < allUsers.length; i++) {
      userIds[allUsers[i].email] = allUsers[i].id;
      studentIds[allStudents[i].studentId] = allStudents[i].id;
    }

    // Get all the rows to insert
    const studentUsers: [string, string][] = [];
    for (const dto of studentDtos) {
      studentUsers.push([studentIds[dto.studentId], userIds[dto.email]]);
    }

    const existing: { student_id: string; user_id: string }[] = (await this
      .dataSource.query(`
      SELECT student_id, user_id
      FROM student_users
      WHERE
        deleted_at IS NULL
        AND (student_id, user_id)
          IN (${studentUsers
            .map(([sid, uid]) => `('${sid}', '${uid}')`)
            .join(", ")});
    `)) as { student_id: string; user_id: string }[];

    const existingStudentUsers: string[] = existing.map(
      (res) => `${res.student_id},${res.user_id}`,
    );

    const toInsert = studentUsers
      .map(([sid, uid]) => `${sid},${uid}`)
      .filter((su) => !existingStudentUsers.includes(su))
      .map((su) => su.split(","));

    await this.studentUserRepository.insert(
      toInsert.map(([sid, uid]) => ({ studentId: sid, userId: uid })),
    );

    const students = await this.studentUserRepository.find({
      relations: {
        student: true,
        user: true,
      },
      where: {
        student: {
          studentId: In(studentDtos.map(({ studentId }) => studentId)),
        },
        deletedAt: IsNull(),
      },
    });

    return students.map((su) => ({
      id: su.studentId,
      email: su.user.email,
      name: su.student.name,
      studentId: su.student.studentId,
    }));
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

  private studentToDto_(student: Student): StudentDto {
    return plainToInstance(StudentDto, student);
  }

  private async validateAll(studentDtos: CreateStudentDto[]) {
    /**
     * Possible errors:
     * 1. Same email but different name
     * 2. Same email but different student id
     * 3. Same student id but different name
     * 4. Same student id but different email
     */

    // Existing students can either be identified using their student id or email
    const existingStudents = await this.studentUserRepository
      .createQueryBuilder("student_users")
      .innerJoinAndSelect("student_users.student", "students")
      .innerJoinAndSelect("student_users.user", "users")
      .where("users.email IN (:...emails)", {
        emails: studentDtos.map((s) => s.email),
      })
      .orWhere("students.student_id IN (:...studentIds)", {
        studentIds: studentDtos.map((s) => s.studentId),
      })
      .distinctOn(["users.id", "students.id", "student_users.deleted_at"])
      .getMany();

    // Convert the DTOs into a dictionary to achieve O(1) read access
    const emailDtos: Record<
      string,
      { row: number; name: string; studentId: string }
    > = {};
    const studentIdDtos: Record<
      string,
      { row: number; name: string; email: string }
    > = {};
    for (let i = 0; i < studentDtos.length; i++) {
      const studentDto = studentDtos[i];
      // TODO: Consider checking for duplicate entries?
      emailDtos[studentDto.email] = {
        row: i,
        name: studentDto.name,
        studentId: studentDto.studentId,
      };
      studentIdDtos[studentDto.studentId] = {
        row: i,
        name: studentDto.name,
        email: studentDto.email,
      };
    }

    const errorMessages = [];
    for (const es of existingStudents) {
      const emailDto = emailDtos[es.user.email];
      const studentIdDto = studentIdDtos[es.student.studentId];

      if (emailDto && studentIdDto) {
        // Different name
        if (emailDto.name !== es.student.name) {
          errorMessages.push({
            index: emailDto.row,
            message: `Student ${es.user.email} already exists as ${es.student.name}.`,
          });
        } else if (studentIdDto.name !== es.student.name) {
          errorMessages.push({
            index: studentIdDto.row,
            message: `Student ${es.student.studentId} already exists as ${es.student.name}.`,
          });
        }
      } else if (!emailDto) {
        // Same student id, different email
        errorMessages.push({
          index: studentIdDto.row,
          message: `Student ${es.student.studentId} already exists as ${es.user.email}.`,
        });
      } else if (!studentIdDto) {
        // Same email, different student id
        errorMessages.push({
          index: emailDto.row,
          message: `Student ${es.user.email} already exists as ${es.student.studentId}.`,
        });
      }
    }

    return errorMessages;
  }
}
