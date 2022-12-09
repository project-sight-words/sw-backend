import { DatabaseService } from "database/database.service";
import { Injectable } from "@nestjs/common";
import { NewTeacher, Teacher, UpdateTeacher } from "entities/teacher.entities";
import { plainToInstance } from "class-transformer";

@Injectable()
export class TeachersRepository {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(teacher: NewTeacher): Promise<Teacher> {
      //TODO: change all database query to database transactions
    const rows = await this.databaseService.query(
      `
      INSERT INTO teachers (staff_id, name)
      VALUES($1, $2)
      RETURNING *
      `,
      [teacher.staffId, teacher.name],
    );
    const newTeacher = plainToInstance(Teacher, rows[0]);
    newTeacher.email = teacher.email;
    return newTeacher;
  }

  async linkTeacherUser(
    userId: string,
    createdBy: string | null,
    teacherId: string,
  ): Promise<void> {
      //TODO: change all database query to database transactions
    await this.databaseService.query(
      `
        INSERT INTO teacher_users (user_id, teacher_id, created_at, created_by)
        VALUES ($1, $2, NOW(), $3)
        RETURNING *
      `,
      [userId, teacherId, createdBy],
    );
  }

  async get(): Promise<Teacher[]> {
      //TODO: change all database query to database transactions
    const rows = await this.databaseService.query(
      `
      SELECT teachers.id, users.email, teachers.staff_id, teachers.name from teachers
      join teacher_users ON teachers.id = teacher_users.teacher_id
      join users on teacher_users.user_id = users.id
      where teacher_users.deleted_at IS NULL
      `,
    );
    return plainToInstance(Teacher, rows);
  }

  async getByTeacherId(teacherId: string | null): Promise<Teacher> {
    const teacher = await this.databaseService.transaction(async (query) => {
      const rows = await query(
        `
        SELECT teachers.id, users.email, teachers.staff_id, teachers.name from teachers
        join teacher_users ON teachers.id = teacher_users.teacher_id
        join users on teacher_users.user_id = users.id
        WHERE teachers.id = $1 and teacher_users.deleted_at IS NULL
      `,
        [teacherId],
      );
      return plainToInstance(Teacher, rows[0]);
    });
    return teacher;
  }

  async updateByTeacherId(
    staffId: string | null,
    updatedBy: string | null,
    teacher: UpdateTeacher,
  ): Promise<Teacher> {
      //TODO: change all database query to database transactions
    const rows = await this.databaseService.query(
      `
      UPDATE teachers
      SET name = $1, staff_id = $2, updated_at = NOW()
      WHERE staff_id = $3
      RETURNING *
      `,
      [teacher.name, teacher.staffId, staffId],
    );
    return plainToInstance(Teacher, rows[0]);
  }

  async deleteByTeacherId(
    teacherId: string,
    deletedBy: string | null,
  ): Promise<Teacher> {
    const deletedTeacher = await this.databaseService.transaction(
      async (query) => {
        const rows = await query(
          `
          SELECT * FROM teachers
          WHERE teachers.id = $1
          `,
          [teacherId],
        );
        return plainToInstance(Teacher, rows[0]);
      },
    );
    await this.databaseService.transaction(async (query) => {
      await query(
        `
        UPDATE teacher_users
        SET deleted_at = NOW(), deleted_by = $2
        WHERE teacher_users.teacher_id = $1
        RETURNING *
      `,
        [teacherId, deletedBy],
      );
    });
    return deletedTeacher;
  }
}
