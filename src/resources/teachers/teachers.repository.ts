import { DatabaseService } from "database/database.service";
import { Injectable } from "@nestjs/common";
import { Querier } from "database/database.types";
import { TeacherDatum, TeacherEntity } from "entities/teacher.entities";

@Injectable()
export class TeachersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async searchByEmail(email: string): Promise<TeacherEntity[]> {
    const rows = await this.databaseService.query(
      `
        SELECT 
          teachers.id AS id, 
          users.email AS email, 
          teachers.staff_id as staff_id, 
          teachers.name AS name,
          teacher_users.created_at AS created_at,
          teacher_users.created_by AS created_by,
          teachers.updated_at AS updated_at,
          teachers.updated_by AS updated_by,
          teacher_users.deleted_at AS deleted_at,
          teacher_users.deleted_by AS deleted_by
        FROM teachers
        JOIN teacher_users 
          ON teachers.id = teacher_users.teacher_id AND teacher_users.deleted_at IS NULL
        JOIN users 
          ON teacher_users.user_id = users.id
        WHERE users.email = $1;
      `,
      [email],
    );
    const teachers = rows.map((r) => TeacherEntity.fromObject(r));
    return teachers;
  }

  async searchById(id: string): Promise<TeacherEntity[]> {
    const teachers = await this.searchByIds(new Set([id]));
    return teachers;
  }

  async searchByIds(ids: Set<string>): Promise<TeacherEntity[]> {
    const idsArray = Array.from(ids);
    const rows = await this.databaseService.query(
      `
        SELECT 
          teachers.id AS id, 
          users.email AS email, 
          teachers.staff_id as staff_id, 
          teachers.name AS name,
          teacher_users.created_at AS created_at,
          teacher_users.created_by AS created_by,
          teachers.updated_at AS updated_at,
          teachers.updated_by AS updated_by,
          teacher_users.deleted_at AS deleted_at,
          teacher_users.deleted_by AS deleted_by
        FROM teachers
        JOIN teacher_users 
          ON teachers.id = teacher_users.teacher_id AND teacher_users.deleted_at IS NULL
        JOIN users 
          ON teacher_users.user_id = users.id
        WHERE teachers.id = ANY($1::UUID[]);
      `,
      [idsArray],
    );
    const teachers = rows.map((r) => TeacherEntity.fromObject(r));
    return teachers;
  }

  async get(): Promise<TeacherEntity[]> {
    const rows = await this.databaseService.query(
      `
        SELECT 
          teachers.id AS id, 
          users.email AS email, 
          teachers.staff_id as staff_id, 
          teachers.name AS name,
          teacher_users.created_at AS created_at,
          teacher_users.created_by AS created_by,
          teachers.updated_at AS updated_at,
          teachers.updated_by AS updated_by,
          teacher_users.deleted_at AS deleted_at,
          teacher_users.deleted_by AS deleted_by
        FROM teachers
        JOIN teacher_users 
          ON teachers.id = teacher_users.teacher_id AND teacher_users.deleted_at IS NULL
        JOIN users 
          ON teacher_users.user_id = users.id;
      `,
    );
    const teachers = rows.map((r) => TeacherEntity.fromObject(r));
    return teachers;
  }

  async getIncludingDeletedByStaffId(
    staffId: string,
  ): Promise<TeacherEntity[]> {
    const rows = await this.databaseService.query(
      `
        WITH most_recent_teacher_users AS (
          SELECT DISTINCT ON (user_id, teacher_id, deleted_at) *
          FROM teacher_users
          ORDER BY deleted_at DESC
        )
        SELECT
          teachers.id AS id,
          users.email AS email,
          teachers.staff_id AS staff_id,
          teachers.name AS name,
          most_recent_teacher_users.created_at AS created_at,
          most_recent_teacher_users.created_by AS created_by,
          teachers.updated_at AS updated_at,
          teachers.updated_by AS updated_by,
          most_recent_teacher_users.deleted_at AS deleted_at,
          most_recent_teacher_users.deleted_by AS deleted_by
        FROM teachers
        JOIN most_recent_teacher_users
          ON teachers.id = most_recent_teacher_users.teacher_id
        LEFT JOIN users
          ON most_recent_teacher_users.user_id = users.id
        WHERE teachers.staff_id = $1;
      `,
      [staffId],
    );
    const teachers = rows.map((r) => TeacherEntity.fromObject(r));
    return teachers;
  }

  async insert(
    query: Querier,
    teacher: Omit<TeacherDatum, "email">,
  ): Promise<string> {
    const { name, staffId } = teacher;
    const rows = (await query(
      `
        INSERT INTO teachers (staff_id, name)
        VALUES ($1, $2)
        RETURNING id;
      `,
      [staffId, name],
    )) as { id: string }[];
    return rows[0].id;
  }

  async insertTeacherUser(
    query: Querier,
    teacherId: string,
    userId: string,
    createdBy: string | null = null,
  ): Promise<void> {
    await query(
      `
        INSERT INTO teacher_users (user_id, teacher_id, created_by)
        VALUES ($1, $2, $3);
      `,
      [userId, teacherId, createdBy],
    );
  }

  // TODO: Fix this to return properly in SQL
  async updateById(
    id: string,
    teacher: Omit<TeacherDatum, "email">,
    updatedBy: string | null = null,
  ): Promise<TeacherEntity> {
    const rows = await this.databaseService.query(
      `
        UPDATE teachers
        SET name = $2, staff_id = $3, updated_at = NOW(), updated_by = $1
        FROM (
          SELECT
            teachers.id AS teacher_id,
            teachers.staff_id AS staff_id,
            users.email AS email
          FROM teachers
          JOIN teacher_users
            ON teachers.id = teacher_users.teacher_id AND teacher_users.deleted_at IS NULL
          JOIN users
            ON teacher_users.user_id = users.id
          WHERE teachers.id = $4
        ) AS subquery
        WHERE teachers.id = subquery.teacher_id
        RETURNING
          teachers.id AS id,
          teachers.staff_id AS staff_id,
          teachers.name AS name,
          subquery.email AS email;
      `,
      [updatedBy, teacher.name, teacher.staffId, id],
    );
    const teachers = rows.map((r) => TeacherEntity.fromObject(r));
    return teachers[0];
  }

  async deleteTeacherUserByTeacherId(
    teacherId: string,
    deletedBy: string | null = null,
  ): Promise<void> {
    await this.databaseService.query(
      `
        UPDATE teacher_users
        SET deleted_at = NOW(), deleted_by = $2
        WHERE teacher_users.teacher_id = $1 AND deleted_at IS NULL
        RETURNING *
      `,
      [teacherId, deletedBy],
    );
  }
}
