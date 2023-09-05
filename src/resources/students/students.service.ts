import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Student, StudentEntity, StudentUser } from "entities/student.entities";
import {
  DataSource,
  EntityManager,
  In,
  IsNull,
  Repository,
  SelectQueryBuilder,
} from "typeorm";
import { UsersService } from "resources/users/users.service";
import {
  CreateStudentDto,
  CreateStudentErrorDto,
  StudentDto,
  UpdateStudentDto,
} from "./dto/students.dto";
import { CreateStamp, DeleteStamp, UpdateStamp } from "entities/common";

type EmailFirst = Record<
  string,
  {
    row: number;
    name: string;
    studentId: string;
  }
>;

type StudentIdFirst = Record<
  string,
  {
    row: number;
    name: string;
    email: string;
  }
>;

// Note: Did not touch the soft delete logic here
@Injectable()
export class StudentsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(StudentUser)
    private readonly studentUserRepository: Repository<StudentUser>,
  ) {}

  private readonly loggerService = new Logger("StudentsService");

  async searchByIds(ids: Set<string>): Promise<StudentEntity[]> {
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

    return students.map((su) => {
      // TODO: Use Student properly
      const se = new StudentEntity();
      se.identifier.id = su.studentId;
      se.datum.studentId = su.student.studentId;
      se.datum.email = su.user.email;
      se.datum.name = su.student.name;
      const createStamp = new CreateStamp();
      createStamp.createdAt = su.createdAt;
      createStamp.createdBy = su.createdBy;
      se.createStamp = createStamp;
      const updateStamp = new UpdateStamp();
      updateStamp.updatedAt = su.student.updatedAt
        ? su.student.updatedAt
        : new Date();
      updateStamp.updatedBy = su.student.updatedBy;
      se.updateStamp = updateStamp;
      const deleteStamp = new DeleteStamp();
      deleteStamp.deletedAt = su.deletedAt;
      deleteStamp.deletedBy = su.deletedBy ? su.deletedBy : "";
      se.deleteStamp = deleteStamp;
      return se;
    });
  }

  async get(): Promise<StudentDto[]> {
    const students = await this.studentUserRepository.find({
      relations: {
        user: true,
        student: true,
      },
      withDeleted: false,
    });
    const studentDtos = students.map((su) => StudentDto.from(su));
    return studentDtos;
  }

  async findOneById(uuid: string): Promise<StudentDto> {
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
    return StudentDto.from(studentUser);
  }

  async updateById(
    uuid: string,
    updateStudentDto: UpdateStudentDto,
    updatedBy: string | null = null,
  ): Promise<StudentDto> {
    const { name, studentId, comments } = updateStudentDto;
    await this.studentRepository
      .createQueryBuilder()
      .select()
      .from(Student, "students")
      .where({ id: uuid })
      .update()
      .set({
        name,
        studentId,
        updatedBy,
        comments,
      })
      .execute();
    return this.findOneById(uuid);
  }

  async deleteById(uuid: string): Promise<void> {
    const results = await this.studentUserRepository
      .createQueryBuilder()
      .softDelete()
      .where("student_id = :studentId", { studentId: uuid })
      .andWhere("deleted_at IS NULL")
      .execute();
    if (results.affected && results.affected !== 1)
      throw new InternalServerErrorException();
  }

  async findExistingStudentsByEmailOrStudentId(
    emails: string[],
    studentIds: string[],
    entityManager: EntityManager | Repository<StudentUser> = this
      .studentUserRepository,
  ) {
    const options = {
      relations: {
        user: true,
        student: true,
      },
      withDeleted: true,
      where: [
        { student: { studentId: In(studentIds) } },
        { user: { email: In(emails) } },
      ],
    };

    if (entityManager instanceof EntityManager)
      return entityManager.find(StudentUser, options);
    else return entityManager.find(options);
  }

  async findByIds(
    ids: string[],
    entityManager: EntityManager | Repository<StudentUser> = this
      .studentUserRepository,
  ): Promise<StudentDto[]> {
    let studentUsers;
    const options = {
      relations: {
        user: true,
        student: true,
      },
      withDeleted: false,
      where: { id: In(ids) },
    };

    if (entityManager instanceof EntityManager)
      studentUsers = await entityManager.find(StudentUser, options);
    else studentUsers = await entityManager.find(options);

    return studentUsers.map((su) => StudentDto.from(su));
  }

  // TODO perform filtering with query instead
  async getWithClassesAndCentres(): Promise<StudentUser[]> {
    const studentUsers = await this.studentUserRepository.find({
      relations: {
        user: true,
        student: {
          classStudents: {
            class: {
              classCentre: { centre: true },
            },
          },
        },
      },
      where: {
        classStudents: {
          class: {
            deletedAt: IsNull(),
          },
        },
      },
      withDeleted: false,
    });
    return studentUsers.map((su) => {
      if (!!su.classStudents)
        su.classStudents = su.classStudents.filter((cs) => !cs.deletedAt);
      return su;
    });
  }

  async createManyStudentsIfNotExists(
    students: CreateStudentDto[],
    queryBuilder: SelectQueryBuilder<Student> = this.studentRepository.createQueryBuilder(),
  ) {
    await queryBuilder
      .insert()
      .values(
        students.map((s) => ({
          name: s.name,
          studentId: s.studentId,
          comments: s.comments,
        })),
      )
      .orIgnore()
      .execute();
  }

  async bulkInsertStudentUsers(
    students: CreateStudentDto[],
    entityManager: EntityManager | Repository<StudentUser> = this
      .studentUserRepository,
  ): Promise<string[]> {
    // Dynamically generate the parameters list
    const parameters: string[] = [];
    for (let i = 1; i <= students.length * 2; i += 2) {
      parameters.push(`($${i}, $${i + 1})`);
    }

    // Using a raw query here since it's the most optimised version of the query
    const insertedStudentUsers: { id: string }[] = (await entityManager.query(
      `
          INSERT INTO student_users (user_id, student_id)
          SELECT p.uid, p.sid
          FROM (SELECT users.id AS uid, students.id AS sid, users.email AS email, students.student_id AS student_id
                FROM students,
                     users) AS p
                   JOIN (VALUES ${parameters.join(", ")}) AS t (e, s)
                        ON t.e = p.email AND t.s = p.student_id
          ON CONFLICT (user_id)
              DO UPDATE SET user_id = excluded.user_id
          RETURNING id;
      `,
      students.map((s) => [s.email, s.studentId]).flat(),
    )) as { id: string }[];

    return insertedStudentUsers.map(({ id }) => id);
  }

  async createMany(
    students: CreateStudentDto[],
  ): Promise<StudentDto[] | CreateStudentErrorDto[]> {
    return this.dataSource.transaction(async (entityManager) => {
      const errors = await this.validate(students, entityManager);
      if (errors.length !== 0) return errors;

      await Promise.all([
        this.usersService.createManyIfNotExists(
          students.map((s) => s.email),
          entityManager,
        ),
        await this.createManyStudentsIfNotExists(
          students,
          entityManager.createQueryBuilder(Student, "students"),
        ),
      ]);

      // Since we know that email and student id are both uniquely identifying, we can retrieve all of the associated user/student ids using them as candidate keys
      const ids = await this.bulkInsertStudentUsers(students, entityManager);

      // Retrieve the inserted students to convert to DTOs
      return await this.findByIds(ids, entityManager);
    });
  }

  private validateRawInput(
    students: CreateStudentDto[],
  ): [false, CreateStudentErrorDto[]] | [true, EmailFirst, StudentIdFirst] {
    const errors: CreateStudentErrorDto[] = [];
    const emailFirst: EmailFirst = {};
    const studentIdFirst: StudentIdFirst = {};
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      if (student.email in emailFirst) {
        errors.push({
          index: i,
          message: `Duplicate email ${student.email} on row ${
            emailFirst[student.email].row
          }`,
        });
        continue;
      }

      if (student.studentId in studentIdFirst) {
        errors.push({
          index: i,
          message: `Duplicate student id ${student.studentId} on row ${
            studentIdFirst[student.studentId].row
          }`,
        });
        continue;
      }

      emailFirst[student.email] = {
        row: i,
        name: student.name,
        studentId: student.studentId,
      };

      studentIdFirst[student.studentId] = {
        row: i,
        name: student.name,
        email: student.email,
      };
    }

    if (errors.length > 0) return [false, errors];
    return [true, emailFirst, studentIdFirst];
  }

  private async validate(
    students: CreateStudentDto[],
    entityManager: EntityManager,
  ): Promise<CreateStudentErrorDto[]> {
    const [status, ...rest] = this.validateRawInput(students);
    // Early return since we won't want to query the database for nothing
    if (!status) return rest[0] as CreateStudentErrorDto[];

    const errors: CreateStudentErrorDto[] = [];
    const [emailFirst, studentIdFirst] = rest as [EmailFirst, StudentIdFirst];

    // Get all existing student users that match the given list of emails or student ids
    const existingStudents = await this.findExistingStudentsByEmailOrStudentId(
      students.map(({ email }) => email),
      students.map(({ studentId }) => studentId),
      entityManager,
    );

    // For each of the existing students, ensure that the input (if any) does not violate
    for (const es of existingStudents) {
      // Get input student with the same student id
      const matchingStudentByStudentId = studentIdFirst[es.student.studentId];
      if (matchingStudentByStudentId) {
        // Ensure that attached email is the same
        if (es.user.email !== matchingStudentByStudentId.email) {
          errors.push({
            index: matchingStudentByStudentId.row,
            message: `Student ID ${es.student.studentId} already in use by another student with email ${es.user.email}`,
          });
          continue;
        }

        // Ensure that associated name is not changed
        if (es.student.name !== matchingStudentByStudentId.name) {
          errors.push({
            index: matchingStudentByStudentId.row,
            message: `Student ID ${es.student.studentId} paired with ${es.user.email} has name of ${es.student.name} but ${matchingStudentByStudentId.name} was given instead.`,
          });
          continue;
        }
      }

      // Get input student with same email
      // Assured that the student id does not pose an issue so we can check the emails now
      const matchingStudentByEmail = emailFirst[es.user.email];
      if (matchingStudentByEmail) {
        // If existing student is deleted, the entry is allowed
        if (es.deletedAt) continue;

        // Ensure that attached student id is the same
        if (es.student.studentId !== matchingStudentByEmail.studentId) {
          errors.push({
            index: matchingStudentByEmail.row,
            message: `Email ${es.user.email} already in use by another student with student id ${es.student.studentId}`,
          });
          continue;
        }

        // Ensure that associated name is not changed
        if (es.student.name !== matchingStudentByEmail.name) {
          errors.push({
            index: matchingStudentByStudentId.row,
            message: `Student ID ${es.student.studentId} paired with ${es.user.email} has name of ${es.student.name} but ${matchingStudentByStudentId.name} was given instead.`,
          });
        }
      }
    }

    return errors;
  }
}
