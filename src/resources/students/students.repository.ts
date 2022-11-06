import { DatabaseService } from "database/database.service";
import { Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { NewStudent, NewStudentUser, Student } from "entities/student.entities";

@Injectable()
export class StudentsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  // TODO: To use raw UUID or student_id
  async getById(id: string): Promise<Student> {
    const rows = await this.databaseService.query(
      `
        SELECT
          users.id AS id,
          users.email AS email,
          students.student_id AS student_id,
          students.name AS name
        FROM students
        JOIN student_users
          ON students.id = student_users.student_id
        JOIN users
          ON student_users.user_id = users.id
        WHERE students.student_id = $1;
      `,
      [id],
    );

    return plainToInstance(Student, rows[0]);
  }

  async get(): Promise<Student[]> {
    const rows = await this.databaseService.query(
      `
        SELECT
          users.id AS id,
          users.email AS email,
          students.student_id AS student_id,
          students.name AS name
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

  async update(student: NewStudent): Promise<Student> {
    // TODO: Allow updating of email from student?
    // Updates should only occur if there's a (single) record in the joining table
    const rows = await this.databaseService.query(
      `
        UPDATE students
        SET name = $1
        FROM (
          SELECT students.student_id AS student_id, users.email AS email
          FROM students
          JOIN student_users
            ON students.id = student_users.student_id
          JOIN users
            ON student_users.user_id = users.id
          WHERE students.student_id = $2
        ) AS subquery
        WHERE students.student_id = subquery.student_id
        RETURNING
          students.student_id AS student_id,
          students.name AS name,
          subquery.email AS email;
      `,
      [student.name, student.studentId],
    );
    return plainToInstance(Student, rows[0]);
  }

  async upsertByEmailAndStudentId(student: NewStudent): Promise<Student> {
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
}
