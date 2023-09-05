import { CreateErrorMessage } from "utils/createErrorMessage";
import {
  DataSource,
  EntityManager,
  FindManyOptions,
  In,
  IsNull,
  Repository,
  SelectQueryBuilder,
} from "typeorm";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Teacher, TeacherDatum, TeacherUser } from "entities/teacher.entities";
import { UsersService } from "resources/users/users.service";

// Note: Did not touch soft delete logic here
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

  // TODO perform filtering with query instead
  async getWithClassesAndCentres(): Promise<TeacherUser[]> {
    const teacherUsers = await this.teacherUserRepository.find({
      relations: {
        user: true,
        teacher: {
          classTeachers: {
            class: {
              classCentre: { centre: true },
            },
          },
        },
      },
      where: {
        teacher: {
          classTeachers: {
            class: {
              deletedAt: IsNull(),
            },
          },
        },
      },
      withDeleted: false,
    });
    return teacherUsers.map((tu) => {
      tu.teacher.classTeachers = tu.teacher.classTeachers.filter(
        (ct) => !ct.deletedAt,
      );
      return tu;
    });
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

  async findOneById(id: string): Promise<TeacherUser | null> {
    const teacherUser = await this.teacherUserRepository.findOne({
      relations: {
        user: true,
        teacher: true,
      },
      withDeleted: false,
      where: {
        teacher: { id },
      },
    });
    return teacherUser;
  }

  async updateById(
    id: string,
    updateTeacher: Omit<TeacherDatum, "email">,
    updatedBy: string | null = null,
  ): Promise<TeacherUser | null> {
    const { name, staffId } = updateTeacher;
    await this.teacherRepository
      .createQueryBuilder()
      .select()
      .from(Teacher, "teachers")
      .where({ id })
      .update()
      .set({
        name,
        staffId,
        updatedBy,
      })
      .execute();
    return this.findOneById(id);
  }

  async deleteById(id: string): Promise<void> {
    const results = await this.teacherUserRepository
      .createQueryBuilder()
      .softDelete()
      .where("teacher_id = :teacherId", { teacherId: id })
      .andWhere("deleted_at IS NULL")
      .execute();
    if (results.affected && results.affected !== 1)
      throw new InternalServerErrorException();
  }

  async findByIds(
    ids: string[],
    querier: EntityManager | Repository<TeacherUser> = this
      .teacherUserRepository,
  ): Promise<TeacherUser[]> {
    const options: FindManyOptions<TeacherUser> = {
      relations: {
        user: true,
        teacher: true,
      },
      withDeleted: false,
      where: { id: In(ids) },
    };

    return querier instanceof EntityManager
      ? await querier.find(TeacherUser, options)
      : await querier.find(options);
  }

  async createManyTeachersIfNotExists(
    teachers: TeacherDatum[],
    queryBuilder: SelectQueryBuilder<Teacher> = this.teacherRepository.createQueryBuilder(),
  ): Promise<void> {
    await queryBuilder
      .insert()
      .values(TeacherDatum.toCreateObjects(teachers))
      .orIgnore()
      .execute();
  }

  async bulkInsertTeacherUsers(
    teachers: TeacherDatum[],
    querier: EntityManager | DataSource = this.dataSource,
  ): Promise<string[]> {
    const parameters: string[] = [];
    for (let i = 1; i <= teachers.length * 2; i += 2) {
      parameters.push(`($${i}, $${i + 1})`);
    }

    const insertedTeacherUsers: { id: string }[] = (await querier.query(
      `
          INSERT INTO teacher_users (user_id, teacher_id)
          SELECT p.uid, p.tid
          FROM (SELECT users.id AS uid, teachers.id AS tid, users.email AS email, teachers.staff_id AS staff_id
                FROM teachers,
                     users) AS p
                   JOIN (VALUES ${parameters.join(", ")}) AS t (e, s)
                        ON t.e = p.email AND t.s = p.staff_id
          ON CONFLICT (user_id)
          WHERE deleted_at IS NULL
              DO
          UPDATE
          SET user_id = excluded.user_id
          RETURNING id;
      `,
      teachers.map((t) => [t.email, t.staffId]).flat(),
    )) as { id: string }[];

    return insertedTeacherUsers.map(({ id }) => id);
  }

  async createMany(
    teachers: TeacherDatum[],
    createdBy: string | null = null,
  ): Promise<TeacherUser[] | CreateErrorMessage[]> {
    return this.dataSource.transaction(async (entityManager) => {
      const errors = await this.validate(teachers, entityManager);
      if (errors.length !== 0) return errors;

      const emails = teachers.map((t) => t.email);
      await Promise.all([
        this.usersService.createManyIfNotExists(emails, entityManager),
        this.createManyTeachersIfNotExists(
          teachers,
          entityManager.createQueryBuilder(Teacher, "teachers"),
        ),
      ]);

      const ids = await this.bulkInsertTeacherUsers(teachers, entityManager);
      return await this.findByIds(ids, entityManager);
    });
  }

  private async validate(
    teachers: TeacherDatum[],
    entityManager: EntityManager,
  ) {
    type TeacherDatumWithRow = TeacherDatum & { row: number };

    const emailsMap = new Map<string, Omit<TeacherDatumWithRow, "email">>();
    const staffIdsMap = new Map<string, Omit<TeacherDatumWithRow, "staffId">>();

    const errors: CreateErrorMessage[] = [];

    for (let i = 0; i < teachers.length; i++) {
      const teacher = teachers[i];
      if (emailsMap.has(teacher.email)) {
        errors.push({
          index: i,
          message: `Duplicate email ${teacher.email} on row ${
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            emailsMap.get(teacher.email)!.row
          }`,
        });
        continue;
      }

      if (staffIdsMap.has(teacher.staffId)) {
        errors.push({
          index: i,
          message: `Duplicate staff id ${teacher.staffId} on row ${
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            staffIdsMap.get(teacher.staffId)!.row
          }`,
        });
        continue;
      }

      emailsMap.set(teacher.email, {
        row: i,
        name: teacher.name,
        staffId: teacher.staffId,
      });

      staffIdsMap.set(teacher.staffId, {
        row: i,
        name: teacher.name,
        email: teacher.email,
      });
    }

    if (errors.length > 0) return errors;

    // Get all existing teacher users that match the given list of emails or staff ids
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
      if (staffIdsMap.has(existingTeacher.teacher.staffId)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const matchingTeacherByStaffId = staffIdsMap.get(
          existingTeacher.teacher.staffId,
        )!;

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

      if (emailsMap.has(existingTeacher.user.email)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const matchingTeacherByEmail = emailsMap.get(
          existingTeacher.user.email,
        )!;

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
