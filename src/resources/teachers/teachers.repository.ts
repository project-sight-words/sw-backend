import { InternalServerErrorException, Logger } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { DatabaseService } from "database/database.service";
import { NewTeacher, Teacher, UserTeacher } from "entities/teacher.entities";

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
      const teacherId = newTeacher.id;

      await this.databaseService.query(
        `
          INSERT INTO user_teacher (user_id, teacher_id, created_at, created_by)
          VALUES ($1, $2, NOW(), $3)
          RETURNING *
        `,
        [userId, teacherId, createdBy],
      );

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
        SELECT * FROM user_teacher
        INNER JOIN users
          ON user_teacher.user_id = user.id
        INNER JOIN teachers
          ON user_teacher.teacher_id = teachers.id
          WHERE user_teacher.deleted_at IS NULL
      `,
      );
      const userTeacherArr = plainToInstance(UserTeacher, rows);
      const teacherRows = await Promise.all(
        userTeacherArr.map((userTeacher) =>
          this.databaseService.query(
            `
            SELECT * FROM teachers
            where teachers.id = $1
            `,
            [userTeacher.id],
          ),
        ),
      );
      return plainToInstance(Teacher, teacherRows);
    } catch (error) {
      this.loggerService.error(error);
      throw new InternalServerErrorException();
    }
  }

  async getTeacher(id: string): Promise<Teacher> {
    try {
      const rows = await this.databaseService.query(
        `
        SELECT * FROM user_teacher
        INNER JOIN users
          ON user_teacher.user_id = user.id
        INNER JOIN teachers
          ON user_teacher.teacher_id = teachers.id
        WHERE user_teacher.teacher_id = ($1) AND user_teacher.deleted_at IS NULL
      `,
        [id],
      );

      const userTeacher = plainToInstance(UserTeacher, rows[0]);
      const teacherRows = await this.databaseService.query(
        `
        SELECT * FROM teachers
        WHERE teachers.id = $1
        `,
        [userTeacher.id],
      );
      return plainToInstance(Teacher, teacherRows[0]);
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
          SELECT teachers.teacher_id AS teacher_id
          FROM teachers
          JOIN user_teacher
          ON teachers.id = user_teacher.teacher_id
          WHERE teachers.teacher_id = $2
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

  async deleteTeacher(id: string, deleted_by: string): Promise<Teacher> {
    try {
      const rows = await this.databaseService.query(
        `
        UPDATE user_teacher
        SET teacher_id = NULL,
            deleted_at = NOW(),
            deleted_by = ($1)
        INNER JOIN users ON user_teacher.user_id=users.id
        INNER JOIN teachers ON user_teacher.teacher_id=teacher.id
        WHERE teacher_id = ($2)
        RETURNING *;
      `,
        [deleted_by, id],
      );

      return plainToInstance(Teacher, rows[0]);
    } catch (error) {
      this.loggerService.error(error);
      throw new InternalServerErrorException();
    }
  }
}
