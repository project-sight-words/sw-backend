import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Student, StudentEntity, StudentUser } from "entities/student.entities";
import { DataSource, EntityManager, In, Repository } from "typeorm";
import { UsersService } from "../users/users.service";
import {
  CreateStudentDto,
  StudentDto,
  UpdateStudentDto,
} from "./dto/students.dto";
import { CreateStamp, DeleteStamp, UpdateStamp } from "entities/common";

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
    const { name, studentId } = updateStudentDto;
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
    if (!student)
      student = await entityManager.save(Student, { name, studentId });

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
      }
    }

    return errorMessages;
  }

  private async validate(students: CreateStudentDto[]) {
    interface propertyFirstBase {
      row: number;
      name: string;
    }

    interface emailFirstInterface extends propertyFirstBase {
      studentId: string;
    }

    interface studentIdFirstInterface extends propertyFirstBase {
      email: string;
    }

    const errors: { index: number; message: string }[] = [];

    const emailFirst: Record<string, emailFirstInterface> = {};
    const studentIdFirst: Record<string, studentIdFirstInterface> = {};
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

    // Early return since we won't want to query the database for nothing
    if (errors.length > 0) return errors;

    // Get all existing student users that match the given list of emails or student ids
    const existingStudents = await this.studentUserRepository.find({
      relations: {
        user: true,
        student: true,
      },
      withDeleted: true,
      where: {
        student: {
          studentId: In(students.map((s) => s.studentId)),
        },
        user: {
          email: In(students.map((s) => s.email)),
        },
      },
    });

    // For each of the existing students, ensure that the input (if any) does not violate
    for (const existingStudent of existingStudents) {
      // Get input student with the same student id
      const matchingStudentByStudentId =
        studentIdFirst[existingStudent.student.studentId];
      if (matchingStudentByStudentId) {
        // If student with same student id already exists, ensure that the email is the same
        if (existingStudent.user.email !== matchingStudentByStudentId.email) {
          errors.push({
            index: matchingStudentByStudentId.row,
            message: `Student ID ${existingStudent.student.studentId} already in use by another student with email ${existingStudent.user.email}`,
          });
          continue;
        }

        // Once email is the same, ensure that the name was not changed from the existing entry
        if (existingStudent.student.name !== matchingStudentByStudentId.name) {
          errors.push({
            index: matchingStudentByStudentId.row,
            message: `Student ID ${existingStudent.student.studentId} paired with ${existingStudent.user.email} has name of ${existingStudent.student.name} but ${matchingStudentByStudentId.name} was given instead.`,
          });
          continue;
        }
      }

      // Get input student with same email
      // Assured that the student id does not pose an issue so we can check the emails now
      const matchingStudentByEmail = emailFirst[existingStudent.user.email];
      if (matchingStudentByEmail) {
        // If existing student is deleted, the entry is allowed
        if (existingStudent.deletedAt) continue;

        // Existing student with email must have same student id as given input
        if (
          existingStudent.student.studentId !== matchingStudentByEmail.studentId
        ) {
          errors.push({
            index: matchingStudentByEmail.row,
            message: `Email ${existingStudent.user.email} already in use by another student with student id ${existingStudent.student.studentId}`,
          });
          continue;
        }

        // Existing student with email must have the same name
        if (existingStudent.student.name !== matchingStudentByEmail.name) {
          errors.push({
            index: matchingStudentByStudentId.row,
            message: `Student ID ${existingStudent.student.studentId} paired with ${existingStudent.user.email} has name of ${existingStudent.student.name} but ${matchingStudentByStudentId.name} was given instead.`,
          });
        }
      }
    }
  }
}
