import { DatabaseService } from "database/database.service";
import { Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { Querier } from "database/database.types";
import {
  NewTeacher,
  NewTeacherUser,
  Teacher,
  UpdateTeacher,
} from "entities/teacher.entities";

@Injectable()
export class TeachersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async insert(
    query: Querier,
    teacher: Omit<NewTeacher, "email">,
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

  async get(): Promise<Teacher[]> {
    const teacher = await this.databaseService.transaction(async (query) => {
      const rows = await query(
        `
          SELECT teachers.id, users.email, teachers.staff_id, teachers.name from teachers
          JOIN teacher_users ON teachers.id = teacher_users.teacher_id
          JOIN users on teacher_users.user_id = users.id
          WHERE teacher_users.deleted_at IS NULL
          `,
      );
      return plainToInstance(Teacher, rows);
    });
    return teacher;
  }

  async getByEmail(email: string): Promise<Teacher[]> {
    const rows = await this.databaseService.query(
      `
        SELECT
          teachers.id as id,
          users.email as email,
          teachers.staff_id as staff_id,
          teachers.name as name
        FROM teachers
        JOIN teacher_users
          ON teachers.id = teacher_users.teacher_id AND teacher_users.deleted_at IS NULL
        JOIN users 
          ON teacher_users.user_id = users.id
        WHERE users.email = $1;
      `,
      [email],
    );
    const teachers = plainToInstance(Teacher, rows);
    return teachers;
  }

  async getById(id: string): Promise<Teacher[]> {
    const rows = await this.databaseService.query(
      `
        SELECT
          teachers.id as id,
          users.email as email,
          teachers.staff_id as staff_id,
          teachers.name as name
        FROM teachers
        JOIN teacher_users
          ON teachers.id = teacher_users.teacher_id AND teacher_users.deleted_at IS NULL
        JOIN users
          ON teacher_users.user_id = users.id
        WHERE teachers.id = $1;
      `,
      [id],
    );
    const teachers = plainToInstance(Teacher, rows);
    return teachers;
  }

  async getIncludingDeletedByStaffId(staffId: string): Promise<Teacher[]> {
    const rows = await this.databaseService.query(
      `
        SELECT
          teachers.id AS id,
          users.email AS email,
          teachers.staff_id AS staff_id,
          teachers.name AS name
        FROM teachers
        LEFT JOIN teacher_users
          ON teachers.id = teacher_users.teacher_id AND teacher_users.deleted_at IS NULL
        LEFT JOIN users
          ON teacher_users.user_id = users.id
        WHERE teachers.staff_id = $1;
      `,
      [staffId],
    );
    const teachers = plainToInstance(Teacher, rows);
    return teachers;
  }

  async updateById(id: string, teacher: UpdateTeacher): Promise<Teacher> {
    const rows = await this.databaseService.query(
      `
        UPDATE teachers
        SET name = $1, staff_id = $2, updated_at = NOW()
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
          WHERE teachers.id = $3
        ) AS subquery
        WHERE teachers.id = subquery.teacher_id
        RETURNING
          teachers.id AS id,
          teachers.staff_id AS staff_id,
          teachers.name AS name,
          subquery.email AS email;
      `,
      [teacher.name, teacher.staffId, id],
    );
    const teachers = plainToInstance(Teacher, rows);
    return teachers[0];
  }

  async deleteById(
    teacherId: string,
    deletedBy: string | null = null,
  ): Promise<Teacher> {
    const rows = await this.databaseService.query(
      `
        UPDATE teacher_users
        SET deleted_at = NOW(), deleted_by = $2
        WHERE teacher_users.teacher_id = $1 AND deleted_at IS NULL
        RETURNING *
      `,
      [teacherId, deletedBy],
    );
    const teachers = plainToInstance(Teacher, rows);
    return teachers[0];
  }

  async isLinked(teacherUser: NewTeacherUser): Promise<boolean> {
    const rows = await this.databaseService.query(
      `
        SELECT *
        FROM users
          INNER JOIN teacher_users ON users.id = teacher_users.user_id
          INNER JOIN teachers ON teacher_users.teacher_id = teachers.id
        WHERE users.id = $1 AND teachers.id = $2;
      `,
      [teacherUser.userId, teacherUser.teacherId],
    );

    return rows.length > 0;
  }
}
