import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { DatabaseService } from "database/database.service";
import { NewTeacher, Teacher, UserTeacher } from "entities/teacher.entities";

@Injectable()
export class TeachersRepository {
  constructor(private readonly databaseService: DatabaseService) {}
  private readonly loggerService = new Logger("Database Service");

  async insertTeacher(
    userId: string,
    createdBy: string,
    teacher: NewTeacher,
  ): Promise<Teacher> {
    try {
      const teacherRows = await this.databaseService.query(
        `
        INSERT INTO teachers(staff_id, name)
        VALUES($1, $2)
        RETURNING *
        `,
        [teacher.staffId, teacher.name],
      );
      const newTeacher = plainToInstance(Teacher, teacherRows[0]);
      console.log(newTeacher);
      newTeacher.email = teacher.email;
      const teacherId = newTeacher.id;
      const rows = await this.databaseService.query(
        `
          INSERT INTO user_teacher (user_id, teacher_id, created_at, created_by)
          VALUES ($1, $2, NOW(), NULL)
          RETURNING *
        `,
        [userId, teacherId],
      );
      console.log(rows);
      return newTeacher;
    } catch (error) {
      if (error instanceof Error) {
        this.loggerService.error(error);
      }
      throw new InternalServerErrorException();
    }
  }

  async getTeachers(): Promise<Teacher[]> {
    try {
      const rows = await this.databaseService.query(
        `
        SELECT * FROM teachers
        JOIN user_teacher ON teachers.id = user_teacher.teacher_id
        JOIN users ON user_teacher.user_id = users.id
        WHERE user_teacher.deleted_at IS NULL
        `,
      );
      console.log(rows);
      return plainToInstance(Teacher, rows);
    } catch (error) {
      this.loggerService.error(error);
      throw new InternalServerErrorException();
    }
  }

  async getTeacher(id: string): Promise<Teacher> {
    try {
      const rows = await this.databaseService.query(
        `
        SELECT * FROM teachers
        INNER JOIN user_teacher ON teachers.id = user_teacher.teacher_id
        INNER JOIN users ON user_teacher.user_id = users.id
        WHERE teachers.staff_id = $1 AND user_teacher.deleted_at IS NULL
        `,
        [id],
      );
      console.log(plainToInstance(Teacher, rows[0]));
      return plainToInstance(Teacher, rows[0]);
    } catch (error) {
      this.loggerService.error(error);
      throw new InternalServerErrorException();
    }
  }

  async updateTeacher(
    updated_by: string,
    teacher: NewTeacher,
  ): Promise<Teacher> {
    try {
      const rows = await this.databaseService.query(
        `
        UPDATE teachers
        SET name = $1
        FROM (
          SELECT *
          FROM teachers
          INNER JOIN user_teacher
          ON teachers.id = user_teacher.teacher_id
          WHERE staff_id = $2
        ) AS subquery
        WHERE teachers.teacher_id = subquery.teacher_id
        RETURNING *;
        `,
        [teacher.name, teacher.staffId],
      );
      return plainToInstance(Teacher, rows[0]);
    } catch (error) {
      this.loggerService.error(error);
      throw new InternalServerErrorException();
    }
  }

  async deleteTeacher(id: string, deletedBy: string): Promise<Teacher> {
    try {
      const deletedTeacherRows = await this.databaseService.query(
        `
        SELECT * FROM teachers
        WHERE teachers.staff_id = $1
        `,
        [id],
      );
      const deletedTeacher = plainToInstance(Teacher, deletedTeacherRows[0]);
      const deletedTeacherId = deletedTeacher.id;
      console.log(deletedTeacherRows[0]);
      const rows = await this.databaseService.query(
        `
        UPDATE user_teacher
        SET deleted_at = NOW(), deleted_by= NULL
        WHERE user_teacher.teacher_id = $1
        RETURNING *
      `,
        [deletedTeacherId],
      );
      console.log(rows);
      return deletedTeacher;
    } catch (error) {
      this.loggerService.error(error);
      throw new InternalServerErrorException();
    }
  }
}
