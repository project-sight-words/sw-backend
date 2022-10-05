import { InternalServerErrorException, Logger } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { DatabaseService } from "database/database.service";
import { NewTeacher, Teacher } from "entities/teacher.entities";

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
          INNER JOIN users
            ON user_teacher.user_id=users.id
          INNER JOIN admins 
            ON user_teacher.teacher_id=teachers.id
          RETURNING *;
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
        SELECT
          users.id AS id,
          users.email AS email,
          teachers.teacher_id AS teacher_id,
          teacher.name AS name
        FROM teachers
        JOIN user_teacher
          ON teacher.id = user_teacher.teacher_id
        JOIN users
          ON user_teacher.user_id = users.id;
      `,
      );

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
        SELECT
          users.id AS id,
          users.email AS email,
          teachers.teacher_id AS teacher_id,
          teacher.name AS name
        FROM teachers
        JOIN user_teacher
          ON teacher.id = user_teacher.teacher_id
        JOIN users
          ON user_teacher.user_id = users.id;
        WHERE teachers.teacher_id = ($1)
      `,
        [id],
      );

      return plainToInstance(Teacher, rows[0]);
    } catch (error) {
      this.loggerService.error(error);
      throw new InternalServerErrorException();
    }
  }
}
