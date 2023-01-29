import { DatabaseService } from "database/database.service";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Querier } from "database/database.types";
import { StudentDatum, StudentEntity } from "entities/student.entities";

@Injectable()
export class StudentsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async searchByEmail(email: string): Promise<StudentEntity[]> {
    const rows = await this.databaseService.query(
      `
        SELECT
          students.id AS id,
          users.email AS email,
          students.student_id AS student_id,
          students.name AS name,
          student_users.created_at AS created_at,
          student_users.created_by AS created_by,
          students.updated_at AS updated_at,
          students.updated_by AS updated_by,
          student_users.deleted_at AS deleted_at,
          student_users.deleted_by AS deleted_by
        FROM students
        JOIN student_users
          ON students.id = student_users.student_id AND student_users.deleted_at IS NULL
        JOIN users
          ON student_users.user_id = users.id
        WHERE users.email = $1;
      `,
      [email],
    );
    const students = rows.map((r) => StudentEntity.fromObject(r));
    return students;
  }

  async searchById(id: string): Promise<StudentEntity[]> {
    const rows = await this.databaseService.query(
      `
        SELECT
          students.id AS id,
          users.email AS email,
          students.student_id AS student_id,
          students.name AS name,
          student_users.created_at AS created_at,
          student_users.created_by AS created_by,
          students.updated_at AS updated_at,
          students.updated_by AS updated_by,
          student_users.deleted_at AS deleted_at,
          student_users.deleted_by AS deleted_by
        FROM students
        JOIN student_users
          ON students.id = student_users.student_id AND student_users.deleted_at IS NULL
        JOIN users
          ON student_users.user_id = users.id
        WHERE students.id = $1;
      `,
      [id],
    );
    const students = rows.map((r) => StudentEntity.fromObject(r));
    return students;
  }

  async getById(id: string): Promise<StudentEntity> {
    const entities = await this.searchById(id);
    if (entities.length !== 1) throw new InternalServerErrorException();
    return entities[0];
  }

  async getByEmail(email: string): Promise<StudentEntity> {
    const entities = await this.searchByEmail(email);
    if (entities.length !== 1) throw new InternalServerErrorException();
    return entities[0];
  }

  async getIncludingDeletedByStudentId(
    studentId: string,
  ): Promise<StudentEntity[]> {
    const rows = await this.databaseService.query(
      `
        WITH most_recent_student_users AS (
          SELECT
            DISTINCT ON (user_id, student_id) *
          FROM student_users
          ORDER BY deleted_at DESC;
        )
        SELECT
          students.id AS id,
          users.email AS email,
          students.student_id AS student_id,
          students.name AS name,
          student_users.created_at AS created_at,
          student_users.created_by AS created_by,
          students.updated_at AS updated_at,
          students.updated_by AS updated_by,
          student_users.deleted_at AS deleted_at,
          student_users.deleted_by AS deleted_by
        FROM students
        JOIN most_recent_student_users
          ON students.id = most_recent_student_users.student_id
        LEFT JOIN users
          ON most_recent_student_users.user_id = users.id
        WHERE students.student_id = $1;
      `,
      [studentId],
    );
    const students = rows.map((r) => StudentEntity.fromObject(r));
    return students;
  }

  async get(): Promise<StudentEntity[]> {
    const rows = await this.databaseService.query(
      `
        SELECT
          students.id AS id,
          users.email AS email,
          students.student_id AS student_id,
          students.name AS name,
          student_users.created_at AS created_at,
          student_users.created_by AS created_by,
          students.updated_at AS updated_at,
          students.updated_by AS updated_by,
          student_users.deleted_at AS deleted_at,
          student_users.deleted_by AS deleted_by
        FROM students
        JOIN student_users
          ON students.id = student_users.student_id AND student_users.deleted_at IS NULL
        JOIN users
          ON student_users.user_id = users.id;
      `,
    );
    const students = rows.map((r) => StudentEntity.fromObject(r));
    return students;
  }

  async insert(
    query: Querier,
    student: Omit<StudentDatum, "email">,
  ): Promise<string> {
    const { studentId, name } = student;
    const rows = (await query(
      `
        INSERT INTO students (student_id, name)
        VALUES ($1, $2)
        RETURNING id;
      `,
      [studentId, name],
    )) as { id: string }[];
    return rows[0].id;
  }

  async update(
    uuid: string,
    student: Omit<StudentDatum, "email">,
  ): Promise<StudentEntity> {
    const rows = await this.databaseService.query(
      `
        UPDATE students
        SET name = $1, student_id = $2, updated_at = NOW()
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
          WHERE students.id = $3
        ) AS subquery
        WHERE students.id = subquery.student_uuid
        RETURNING
          students.id AS id,
          students.student_id AS student_id,
          students.name AS name,
          subquery.email AS email;
      `,
      [student.name, student.studentId, uuid],
    );
    const students = rows.map((r) => StudentEntity.fromObject(r));
    return students[0];
  }

  async upsertByStudentId(student: StudentDatum): Promise<StudentEntity> {
    const rows = await this.databaseService.query(
      `
        INSERT INTO students (student_id, name)
        VALUES ($1, $2)
        ON CONFLICT (UPPER(student_id))
        DO
        UPDATE SET updated_at = NOW()
        RETURNING *;
      `,
      [student.studentId, student.name],
    );
    const newStudent = StudentEntity.fromObject({
      ...rows[0],
      email: student.email,
    });
    return newStudent;
  }

  async insertStudentUser(
    query: Querier,
    studentId: string,
    userId: string,
  ): Promise<void> {
    await query(
      `
        INSERT INTO student_users (user_id, student_id)
        VALUES ($1, $2);
      `,
      [userId, studentId],
    );
  }

  async deleteStudentUser(
    studentId: string,
    deletedBy: string | null = null,
  ): Promise<void> {
    const rows = await this.databaseService.query(
      `
        UPDATE student_users
        SET deleted_at = NOW(), deleted_by = $1
        WHERE students.id = $2 AND deleted_at IS NULl;
      `,
      [deletedBy, studentId],
    );
    if (rows.length !== 1) throw new InternalServerErrorException();
  }
}
