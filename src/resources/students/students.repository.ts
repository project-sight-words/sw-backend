import { Injectable } from "@nestjs/common";
import { plainToClass } from "class-transformer";
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
  ) {}

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
