import { DatabaseService } from "database/database.service";
import { Injectable } from "@nestjs/common";
import { NewStudent, NewStudentUser, Student } from "entities/student.entities";
import { plainToInstance } from "class-transformer";
import * as Uuid from "utils/uuid";

@Injectable()
export class StudentsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getById(id: string) {
    const rows = await this.databaseService.query(
      `
        SELECT
          students.id AS id,
          users.email AS email,
          students.student_id AS student_id,
          students.name AS name
        FROM students
        JOIN student_users
          ON students.id = student_users.student_id
        JOIN users
          ON student_users.user_id = users.id
        WHERE students.${!Uuid.test(id) ? "student_id" : "id"} = $1;
      `,
      [id],
    );

    return plainToInstance(Student, rows[0]);
  }

  async get(): Promise<Student[]> {
    const rows = await this.databaseService.query(
      `
        SELECT
          students.id AS id,
          users.email AS email,
          students.student_id AS student_id,
          students.name AS name,
          students.updated_at as updated_at,
          students.updated_by as updated_by
        FROM students
        JOIN student_users
          ON students.id = student_users.student_id
        JOIN users
          ON student_users.user_id = users.id;
      `,
      [],
    );

    return plainToInstance(Student, rows);
  }

  async update(studentUUID: string, student: NewStudent): Promise<Student> {
    // Updates should only occur if there's a (single) record in the joining table
    const rows = await this.databaseService.query(
      `
        UPDATE students
        SET name = $1, student_id = $2
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
      [student.name, student.studentId, studentUUID],
    );
    return plainToInstance(Student, rows[0]);
  }

  async upsertByStudentId(student: NewStudent): Promise<Student> {
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
    const newStudent = plainToInstance(Student, rows[0]);
    newStudent.email = student.email;
    return newStudent;
  }

  async linkToUser(
    studentUser: NewStudentUser,
    student: Student,
  ): Promise<Student> {
    await this.databaseService.query(
      `
        INSERT INTO student_users (user_id, student_id)
        VALUES ($1, $2);
      `,
      [studentUser.userId, studentUser.studentId],
    );

    return student;
  }

  async isLinked(studentUser: NewStudentUser): Promise<boolean> {
    const rows = await this.databaseService.query(
      `
        SELECT *
        FROM users
          INNER JOIN student_users ON users.id = student_users.user_id
          INNER JOIN students ON student_users.student_id = students.id
        WHERE users.id = $1 AND students.id = $2;
      `,
      [studentUser.userId, studentUser.studentId],
    );

    return rows.length > 0;
  }
}
