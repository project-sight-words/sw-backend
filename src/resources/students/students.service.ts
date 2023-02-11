import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
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

  async searchByIds(ids: Set<string>): Promise<Student[]> {
    const students = await this.studentUserRepository.find({
      relations: {
        user: true,
        student: true
      },
      withDeleted: false,
      where: {
        student: {
          studentId: In(Array.from(ids))
        }
      }
    })

    return students.map(su => su.student)
  }

  async get(): Promise<StudentDto[]> {
    const students = await this.studentUserRepository.find({
      relations: {
        user: true,
        student: true
      },
      withDeleted: false,
    })
    const studentDtos = students.map(su => ({
      id: su.studentId,
      email: su.user.email,
      name: su.student.name,
      studentId: su.student.studentId
    }));
    return studentDtos;
  }

  async getById(uuid: string): Promise<StudentDto> {
    const studentUser = await this.studentUserRepository.findOne({
      relations: {
        user: true,
        student: true
      },
      withDeleted: false,
      where: {
        studentId: uuid
      }
    })
    // Throw Not Found instead since it's more logical to do so for students that cannot be found
    if (!studentUser) throw new NotFoundException();
    return this.studentUserToStudentDto(studentUser);
  }

  async updateById(
    uuid: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<StudentDto> {
    // Must use raw queries as subquery in update is not supported by TypeORM
    // TODO: Fix this to return properly in SQL
    const students = await this.dataSource.query(
      `
        UPDATE students
        SET name = $2, student_id = $3, updated_at = NOW(), updated_by = $1
        FROM (
          SELECT
            students.id as student_uuid,
            students.student_id AS student_id,
            users.email AS email
          FROM students
          JOIN student_users
            ON students.id = student_users.student_id
          JOIN users
            ON student_users.user_id = users.id
          WHERE students.id = $4
        ) AS subquery
        WHERE students.id = subquery.student_uuid
        RETURNING
          students.id AS id,
          students.student_id AS student_id,
          students.name AS name,
          subquery.email AS email;
      `,
      [null, updateStudentDto.name, updateStudentDto.studentId, uuid]
    ) as { id: string, student_id: string, name: string, email: string }[]
    const studentDto = {
      id: students[0].id,
      email: students[0].email,
      name: students[0].name,
      studentId: students[0].student_id
    }
    return studentDto;
  }

  async deleteById(uuid: string): Promise<void> {
    const results = await this.studentUserRepository
      .createQueryBuilder()
      .update()
      .set({ deletedAt: "now()", deletedBy: null })
      .where("student_id = :studentId", { studentId: uuid })
      .andWhere("deleted_at IS NULL")
      .execute()
    if (results.affected && results.affected !== 1) throw new InternalServerErrorException()
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

  private studentUserToStudentDto(studentUser: StudentUser): StudentDto {
    return {
      id: studentUser.studentId,
      email: studentUser.user.email,
      name: studentUser.student.name,
      studentId: studentUser.student.studentId
    }
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
