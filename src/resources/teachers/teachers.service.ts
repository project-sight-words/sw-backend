import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { CreateTeacherDto } from "./dto/teachers.dto";
import { Teacher, TeacherDatum, TeacherUser } from "entities/teacher.entities";
import { UsersService } from "resources/users/users.service";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, In, Repository } from "typeorm";

@Injectable()
export class TeachersService {
  constructor(
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(TeacherUser)
    private readonly teacherUserRepository: Repository<TeacherUser>,
  ) {}

  async searchByIds(ids: Set<string>): Promise<TeacherUser[]> {
    const teacherUsers = await this.teacherUserRepository.find({
      relations: {
        user: true,
        teacher: true,
      },
      withDeleted: false,
      where: {
        teacher: {
          staffId: In(Array.from(ids)),
        },
      },
    });
    return teacherUsers;
  }

  async get(): Promise<TeacherUser[]> {
    const teacherUsers = await this.teacherUserRepository.find({
      relations: {
        user: true,
        teacher: true,
      },
      withDeleted: false,
    });
    return teacherUsers;
  }

  async findOneById(uuid: string): Promise<TeacherUser | null> {
    const teacherUser = await this.teacherUserRepository.findOne({
      relations: {
        user: true,
        teacher: true,
      },
      withDeleted: false,
      where: {
        teacher: { id: uuid },
      },
    });
    return teacherUser;
  }

  async updateById(
    uuid: string,
    updateTeacherDto: Omit<CreateTeacherDto, "email">,
    updatedBy: string | null = null,
  ): Promise<TeacherUser | null> {
    const { name, staffId } = updateTeacherDto;
    await this.teacherRepository
      .createQueryBuilder()
      .select()
      .from(Teacher, "teachers")
      .where({ id: uuid })
      .update()
      .set({
        name,
        staffId,
        updatedBy,
      })
      .execute();
    return this.findOneById(uuid);
  }

  async deleteById(uuid: string): Promise<void> {
    const results = await this.teacherUserRepository
      .createQueryBuilder()
      .softDelete()
      .where("teacher_id = :teacherId", { teacherId: uuid })
      .andWhere("deleted_at IS NULL")
      .execute();
    if (results.affected && results.affected !== 1)
      throw new InternalServerErrorException();
  }

  async findByIds(
    ids: string[],
    entityManager: EntityManager | null = null,
  ): Promise<TeacherUser[]> {
    let teacherUsers;
    const options = {
      relations: {
        user: true,
        teacher: true,
      },
      withDeleted: false,
      where: { id: In(ids) },
    };

    if (!entityManager)
      teacherUsers = await this.teacherUserRepository.find(options);
    else teacherUsers = await entityManager.find(TeacherUser, options);

    return teacherUsers;
  }

  async createManyTeachersIfNotExists(
    teachers: TeacherDatum[],
    querier: EntityManager | Repository<Teacher> = this.teacherRepository,
  ): Promise<void> {
    await querier
      .createQueryBuilder()
      .insert()
      .values(teachers.map((t) => ({ name: t.name, staffId: t.staffId })))
      .orIgnore()
      .execute();
  }

  async bulkInsertTeacherUsers(
    teachers: TeacherDatum[],
    querier: EntityManager | DataSource = this.dataSource,
  ): Promise<string[]> {
    // TODO: Refactor to guard against potential SQL injection
    const association = teachers
      .map((s) => `('${s.email}', '${s.staffId}')`)
      .join(", ");

    const insertedTeacherUsers: { id: string }[] = (await querier.query(`
        INSERT INTO teacher_users (user_id, teacher_id)
        SELECT p.uid, p.tid
        FROM (SELECT users.id AS uid, teachers.id AS tid, users.email AS email, teachers.staff_id AS staff_id
              FROM teachers,
                   users) AS p
                 JOIN (VALUES ${association}) AS t (e, s)
                      ON t.e = p.email AND t.s = p.staff_id
        ON CONFLICT (staff_id)
            DO UPDATE SET id = excluded.id
        RETURNING *;
    `)) as { id: string }[];

    return insertedTeacherUsers.map(({ id }) => id);
  }

  async createMany(
    teachers: TeacherDatum[],
    createdBy: string | null = null,
  ): Promise<TeacherUser[]> {
    return this.dataSource.transaction(async (entityManager) => {
      const errors = await this.validate(teachers, entityManager);
      if (errors.length !== 0) throw new BadRequestException(errors);

      const emails = teachers.map((t) => t.email);
      const [ids] = await Promise.all([
        this.bulkInsertTeacherUsers(teachers, entityManager),
        // TODO: Uncomment following after usersService updated
        // this.usersService.createManyIfNotExists(emails, entityManager),
        this.createManyTeachersIfNotExists(teachers, entityManager),
      ]);
      return this.findByIds(ids);
    });
  }

  private async validate(
    teachers: TeacherDatum[],
    entityManager: EntityManager,
  ) {
    type TeacherDatumWithRow = TeacherDatum & { row: number };

    const emailsMap: Record<string, Omit<TeacherDatumWithRow, "email">> = {};
    const staffIdsMap: Record<
      string,
      Omit<TeacherDatumWithRow, "staffId">
    > = {};

    const errors: { index: number; message: string }[] = [];

    for (let i = 0; i < teachers.length; i++) {
      const teacher = teachers[i];
      if (teacher.email in emailsMap) {
        errors.push({
          index: i,
          message: `Duplicate email ${teacher.email} on row ${
            emailsMap[teacher.email].row
          }`,
        });
        continue;
      }

      if (teacher.staffId in staffIdsMap) {
        errors.push({
          index: i,
          message: `Duplicate staff id ${teacher.staffId} on row ${
            staffIdsMap[teacher.staffId].row
          }`,
        });
        continue;
      }

      emailsMap[teacher.email] = {
        row: i,
        name: teacher.name,
        staffId: teacher.staffId,
      };

      staffIdsMap[teacher.staffId] = {
        row: i,
        name: teacher.name,
        email: teacher.email,
      };
    }

    if (errors.length > 0) return errors;

    const existingTeachers = await entityManager.find(TeacherUser, {
      relations: {
        user: true,
        teacher: true,
      },
      withDeleted: true,
      where: [
        {
          teacher: {
            staffId: In(teachers.map((t) => t.staffId)),
          },
        },
        {
          user: {
            email: In(teachers.map((t) => t.email)),
          },
        },
      ],
    });

    for (const existingTeacher of existingTeachers) {
      if (existingTeacher.teacher.staffId in staffIdsMap) {
        const matchingTeacherByStaffId =
          staffIdsMap[existingTeacher.teacher.staffId];

        if (existingTeacher.user.email !== matchingTeacherByStaffId.email) {
          errors.push({
            index: matchingTeacherByStaffId.row,
            message: `Teacher ID ${existingTeacher.teacher.staffId} already in use by another teacher with email ${existingTeacher.user.email}`,
          });
          continue;
        }

        if (existingTeacher.teacher.name !== matchingTeacherByStaffId.name) {
          errors.push({
            index: matchingTeacherByStaffId.row,
            message: `Teacher ID ${existingTeacher.teacher.staffId} paired with ${existingTeacher.user.email} has name of ${existingTeacher.teacher.name} but ${matchingTeacherByStaffId.name} was given instead.`,
          });
          continue;
        }
      }

      if (existingTeacher.user.email in emailsMap) {
        const matchingTeacherByEmail = emailsMap[existingTeacher.user.email];

        if (existingTeacher.deletedAt) continue;

        if (
          existingTeacher.teacher.staffId !== matchingTeacherByEmail.staffId
        ) {
          errors.push({
            index: matchingTeacherByEmail.row,
            message: `Email ${existingTeacher.user.email} already in use by another teacher with teacher id ${existingTeacher.teacher.staffId}`,
          });
          continue;
        }

        if (existingTeacher.teacher.name !== matchingTeacherByEmail.name) {
          errors.push({
            index: matchingTeacherByEmail.row,
            message: `Teacher ID ${existingTeacher.teacher.staffId} paired with ${existingTeacher.user.email} has name of ${existingTeacher.teacher.name} but ${matchingTeacherByEmail.name} was given instead.`,
          });
        }
      }
    }
    return errors;
  }
}
