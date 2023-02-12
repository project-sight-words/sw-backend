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
import { DataSource, EntityManager, In, Repository } from "typeorm";
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
        student: true,
      },
      withDeleted: false,
      where: {
        student: {
          studentId: In(Array.from(ids)),
        },
      },
    });

    return students.map((su) => su.student);
  }

  async get(): Promise<StudentDto[]> {
    const students = await this.studentUserRepository.find({
      relations: {
        user: true,
        student: true,
      },
      withDeleted: false,
    });
    const studentDtos = students.map(
      (su) =>
        ({
          id: su.studentId,
          email: su.user.email,
          name: su.student.name,
          studentId: su.student.studentId,
        } as StudentDto),
    );
    return studentDtos;
  }

  async getById(uuid: string): Promise<StudentDto> {
    const studentUser = await this.studentUserRepository.findOne({
      relations: {
        user: true,
        student: true,
      },
      withDeleted: false,
      where: {
        studentId: uuid,
      },
    });
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
    const students = (await this.dataSource.query(
      `
          UPDATE students
          SET name       = $2,
              student_id = $3,
              updated_at = NOW(),
              updated_by = $1
          FROM (SELECT students.id         as student_uuid,
                       students.student_id AS student_id,
                       users.email         AS email
                FROM students
                         JOIN student_users
                              ON students.id = student_users.student_id
                         JOIN users
                              ON student_users.user_id = users.id
                WHERE students.id = $4) AS subquery
          WHERE students.id = subquery.student_uuid
          RETURNING
              students.id AS id,
              students.student_id AS student_id,
              students.name AS name,
              subquery.email AS email;
      `,
      [null, updateStudentDto.name, updateStudentDto.studentId, uuid],
    )) as { id: string; student_id: string; name: string; email: string }[];
    const studentDto: StudentDto = {
      id: students[0].id,
      email: students[0].email,
      name: students[0].name,
      studentId: students[0].student_id,
    };
    return studentDto;
  }

  async deleteById(uuid: string): Promise<void> {
    const results = await this.studentUserRepository
      .createQueryBuilder()
      .update()
      .set({ deletedAt: "now()", deletedBy: null })
      .where("student_id = :studentId", { studentId: uuid })
      .andWhere("deleted_at IS NULL")
      .execute();
    if (results.affected && results.affected !== 1)
      throw new InternalServerErrorException();
  }

  async createMany(studentDtos: CreateStudentDto[]): Promise<StudentDto[]> {
    return await this.dataSource.transaction(async (entityManager) => {
      const createdStudents = [];
      for (const studentDto of studentDtos) {
        try {
          const student = await this.createOne(studentDto, entityManager);
          createdStudents.push(student);
        } catch (e: unknown) {
          this.loggerService.error(e);
          const errorMessages = await this.validateAll(
            studentDtos,
            entityManager,
          );
          throw new BadRequestException(errorMessages);
        }
      }
      return createdStudents;
    });
  }

  async createOne(
    studentDto: CreateStudentDto,
    entityManager: EntityManager,
  ): Promise<StudentDto> {
    const { email, name, studentId } = studentDto;

    let user = await this.usersService.findOneByEmail(email);
    if (!user) user = await this.usersService.create(email);

    let student = await entityManager.findOneBy(Student, { studentId });
    if (!student) {
      student = await entityManager.save(Student, { name, studentId });
    }

    if (student.name !== name)
      throw new BadRequestException(
        "Student's recorded name does not match given name.",
      );

    const isExisting = await entityManager.findOneBy(StudentUser, {
      studentId: student.id,
      userId: user.id,
    });
    if (!isExisting) {
      await entityManager.save(StudentUser, {
        student,
        user,
      });
    }

    return {
      email,
      id: student.id,
      name,
      studentId,
    };
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
      studentId: studentUser.student.studentId,
    };
  }

  private async validateAll(
    studentDtos: CreateStudentDto[],
    entityManager: EntityManager,
  ) {
    const errorMessages = [];
    for (let index = 0; index < studentDtos.length; index++) {
      const { email, name, studentId } = studentDtos[index];
      let studentUser = await entityManager.findOne(StudentUser, {
        relations: {
          user: true,
          student: true,
        },
        withDeleted: true,
        where: { student: { studentId } },
      });
      if (!studentUser) {
        studentUser = await entityManager.findOne(StudentUser, {
          relations: {
            user: true,
            student: true,
          },
          withDeleted: false,
          where: { user: { email: email } },
        });
        if (studentUser?.student) {
          errorMessages.push({
            index,
            message: `Email ${email} belongs to Student ${studentId}.`,
          });
        }

        continue;
      }

      switch (true) {
        case studentUser.student.name !== name:
          errorMessages.push({
            index,
            message: `Student ${studentId} already exists as ${studentUser.student.name}.`,
          });
          break;
        case studentUser.user.email !== email:
          errorMessages.push({
            index,
            message: `Student ${studentId} has email ${studentUser.user.email}.`,
          });
          break;
        default:
          errorMessages.push({
            index,
            message: `Student ${studentId} ${studentUser.user.email} already exists.`,
          });
          break;
      }
    }

    return errorMessages;
  }
}
