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
    const studentDtos = students.map((su) => this.studentUserToStudentDto(su));
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
    const { name, studentId } = updateStudentDto;
    const studentUser = await this.studentUserRepository.findOne({
      relations: {
        user: true,
        student: true,
      },
      withDeleted: true,
      where: { studentId: uuid },
    });
    if (!studentUser) throw new NotFoundException();
    studentUser.student.name = name;
    studentUser.student.studentId = studentId;
    studentUser.student.updatedBy = null;
    await this.studentUserRepository.save(studentUser);
    return this.studentUserToStudentDto(studentUser);
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
