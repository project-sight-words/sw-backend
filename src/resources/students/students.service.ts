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
    // Only retrieve the latest status of the relationship (NULL if not deleted or latest deleted_at date)
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
      .distinctOn(["students.id", "users.id"])
      .orderBy("student_users.deleted_at", "DESC", "NULLS FIRST")
      .getMany();

    // Convert the DTOs into a dictionary to achieve O(1) read access
    interface insertRow {
      row: number;
      name: string;
    }
    interface insertStudentIdRow extends insertRow {
      studentId: string;
    }
    interface insertEmailRow extends insertRow {
      email: string;
    }

    const emailDtos: Record<string, insertStudentIdRow> = {};
    const studentIdDtos: Record<string, insertEmailRow> = {};
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

      if (studentIdDto) {
        // If the attempted insert's student ID already exists
        if (studentIdDto.email !== es.user.email) {
          // If the student ID exists, then it must be unique (tied to only 1 email)
          errorMessages.push({
            index: studentIdDto.row,
            message: `Student ${es.student.studentId} already exists as ${es.user.email}.`,
          });
        } else if (studentIdDto.name !== es.student.name) {
          // If the student ID and email match, then the name cannot change
          errorMessages.push({
            index: studentIdDto.row,
            message: `Student ${es.student.studentId} cannot be renamed as it already exists as ${es.student.name}.`,
          });
        }
      } else {
        // If the attempted insert's email already exists
        if (!es.deletedAt && emailDto.studentId !== es.student.studentId) {
          // If the student has not been deleted yet, then the insert's student ID must match the current student ID
          errorMessages.push({
            index: emailDto.row,
            message: `Student ${emailDto.studentId} cannot be created again as it already exists as ${es.student.studentId}.`,
          });
        }
      }

      return errorMessages;
    }
  }
}
