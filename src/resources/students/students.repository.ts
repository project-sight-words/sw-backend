import { DatabaseService } from "database/database.service";
import { Injectable } from "@nestjs/common";
import { NewStudent, Student, StudentUser } from "entities/student.entities";
import { plainToInstance } from "class-transformer";
import { Querier } from "database/database.types";

@Injectable()
export class StudentsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getById(id: string): Promise<Student[]> {
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
        WHERE students.id = $1;
      `,
      [id],
    );
    const students = plainToInstance(Student, rows);
    return students;
  }

  async getByEmail(email: string): Promise<Student[]> {
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
        WHERE users.email = $1;
      `,
      [email],
    );
    const students = plainToInstance(Student, rows);
    return students;
  }

  async getIncludingDeletedByStudentId(studentId: string): Promise<Student[]> {
    const rows = await this.databaseService.query(
      `
        SELECT
          students.id AS id,
          users.email AS email,
          students.student_id AS student_id,
          students.name AS name
        FROM students
        LEFT JOIN student_users
          ON students.id = student_users.student_id
        LEFT JOIN users
          ON student_users.user_id = users.id
        WHERE students.student_id = $1;
      `,
      [studentId],
    );
    const students = plainToInstance(Student, rows);
    return students;
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
    );
    const students = plainToInstance(Student, rows);
    return students;
  }

  async insert(
    query: Querier,
    student: Omit<NewStudent, "email">,
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
    student: Omit<NewStudent, "email">,
  ): Promise<Student> {
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
    const students = plainToInstance(Student, rows);
    return students[0];
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

  async getStudentUser(
    studentId: string,
    userId: string,
  ): Promise<StudentUser[]> {
    const rows = await this.databaseService.query(
      `
        SELECT *
        FROM users
          INNER JOIN student_users ON users.id = student_users.user_id
          INNER JOIN students ON student_users.student_id = students.id
        WHERE users.id = $1 AND students.id = $2;
      `,
      [userId, studentId],
    );
    const studentUsers = plainToInstance(StudentUser, rows);
    return studentUsers;
  }
}
