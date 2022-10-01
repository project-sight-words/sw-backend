import { Injectable } from "@nestjs/common";
import { plainToClass, plainToInstance } from "class-transformer";
import { DatabaseService } from "../../database/database.service";
import {
  NewStudent,
  Student,
  UserStudent,
} from "../../entities/student.entities";
import { UsersRepository } from "../users/users.repository";

@Injectable()
export class StudentsRepository {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly usersRepository: UsersRepository,
  ) { }

  async getStudentById(id: string): Promise<Student | null> {
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

    if (!rows[0]) return null;

    return plainToClass(Student, rows[0]);
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

  async updateStudent(student: NewStudent): Promise<Student> {
    // TODO: Allow updating of email from student?
    // Updates should only occur if there's a (single) record in the joining table
    const updateStudent = await this.databaseService.query(
      `
        UPDATE students
        SET name = $1
        FROM (
          SELECT students.student_id AS student_id
          FROM students
          JOIN user_students
          ON students.id = user_students.student_id
          WHERE students.student_id = $2
        ) AS subquery
        WHERE students.student_id = subquery.student_id
        RETURNING *;
      `,
      [student.name, student.studentId],
    );

    return plainToClass(Student, updateStudent[0]);
  }

  async upsertByEmailAndStudentId(student: NewStudent): Promise<Student> {
    const newUser = await this.usersRepository.upsertByEmail({
      email: student.email,
      lastLoggedIn: null,
    });

    // TODO: Don't set updated_at?
    // TODO: Wrap into ORM transaction?
    const upsertStudent = await this.databaseService.query(
      `
        INSERT INTO students (student_id, name)
        VALUES ($1, $2)
        ON CONFLICT (student_id)
        DO
        UPDATE SET updated_at = NOW()
        RETURNING *;
      `,
      [student.studentId, student.name],
    );
    const newStudent = plainToClass(Student, upsertStudent[0]);
    newStudent.email = student.email;

    // Do nothing ON CONFLICT for now as nothing can be updated
    const upsertUserStudent = await this.databaseService.query(
      `
        INSERT INTO user_students (user_id, student_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, student_id)
        DO NOTHING
        RETURNING *;
      `,
      [newUser.id, newStudent.id],
    );
    const newUserStudent = plainToClass(UserStudent, upsertUserStudent[0]);
    newStudent.userStudent = newUserStudent;

    return newStudent;
  }
}
