import { Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { DatabaseService } from "../../database/database.service";
import {
  NewStudent,
  NewUserStudent,
  Student,
  UserStudent,
} from "../../entities/student.entities";

@Injectable()
export class StudentsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getStudentById(id: string): Promise<Student> {
    const rows = await this.databaseService.query(
      `
        SELECT
          users.id AS id,
          users.email AS email,
          students.student_id AS student_id,
          students.name AS name
        FROM students
        JOIN user_students
          ON students.id = user_students.student_id
        JOIN users
          ON user_students.user_id = users.id
        WHERE students.student_id = $1;
      `,
      [id],
    );

    return plainToInstance(Student, rows[0]);
  }

  async getAllStudents(): Promise<Student[]> {
    const rows = await this.databaseService.query(
      `
        SELECT
          users.id AS id,
          users.email AS email,
          students.student_id AS student_id,
          students.name AS name
        FROM students
        JOIN user_students
          ON students.id = user_students.student_id
        JOIN users
          ON user_students.user_id = users.id;
      `,
      [],
    );

    return plainToInstance(Student, rows);
  }

  async updateStudent(studentId: string, newName: string): Promise<Student> {
    // TODO: Allow updating of email from student?
    // Updates should only occur if there's a (single) record in the joining table
    const updateStudent = await this.databaseService.query(
      `
        UPDATE students
        SET name = $1
        FROM (
          SELECT students.student_id AS student_id, users.email AS email
          FROM students
          JOIN user_students
            ON students.id = user_students.student_id
          JOIN users
            ON user_students.user_id = users.id
          WHERE students.student_id = $2
        ) AS subquery
        WHERE students.student_id = subquery.student_id
        RETURNING
          students.student_id AS student_id,
          students.name AS name,
          subquery.email AS email;
      `,
      [newName, studentId],
    );
    return plainToInstance(Student, updateStudent[0]);
  }

  async upsertByEmailAndStudentId(student: NewStudent): Promise<Student> {
    // TODO: Don't set updated_at?
    // TODO: Wrap into ORM transaction?
    const upsertStudent = await this.databaseService.query(
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
    const newStudent = plainToInstance(Student, upsertStudent[0]);
    newStudent.email = student.email;
    return newStudent;
  }

  async linkStudentToUser(
    userStudent: NewUserStudent,
    student: Student,
  ): Promise<Student> {
    const insertUserStudent = await this.databaseService.query(
      `
        INSERT INTO user_students (user_id, student_id)
        VALUES ($1, $2);
      `,
      [userStudent.userId, userStudent.studentId],
    );
    const newUserStudent = plainToInstance(UserStudent, insertUserStudent[0]);
    student.userStudent = newUserStudent;

    return student;
  }
}
