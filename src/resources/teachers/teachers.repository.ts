import { Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { DatabaseService } from "database/database.service";
import { NewTeacher, Teacher, TeacherUser } from "entities/teacher.entities";

@Injectable()
export class TeachersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async insert(teacher: NewTeacher): Promise<Teacher> {
    const teacherRows = await this.databaseService.query(
      `
      INSERT INTO teachers (staff_id, name)
      VALUES($1, $2)
      RETURNING *
      `,
      [teacher.staffId, teacher.name],
    );
    const newTeacher = plainToInstance(Teacher, teacherRows[0]);
    newTeacher.email = teacher.email;
    return newTeacher;
  }

  async linkTeacherUser(
    userId: string,
    createdBy: string,
    teacherId: string,
  ): Promise<void> {
    await this.databaseService.query(
      `
        INSERT INTO teacher_users (user_id, teacher_id, created_at, created_by)
        VALUES ($1, $2, NOW(), $3)
        RETURNING *
      `,
      [userId, teacherId, createdBy],
    );
  }

  async getAll(): Promise<Teacher[]> {
    const rows = await this.databaseService.query(
      `
      SELECT * FROM teachers
      JOIN teacher_users ON teachers.id = teacher_users.teacher_id
      JOIN users ON teacher_users.user_id = users.id
      WHERE teacher_users.deleted_at IS NULL
      `,
    );
    return plainToInstance(Teacher, rows);
  }

  async get(id: string): Promise<Teacher> {
    const rows = await this.databaseService.query(
      `
      SELECT * FROM teachers
      INNER JOIN teacher_users ON teachers.id = teacher_users.teacher_id
      INNER JOIN users ON teacher_users.user_id = users.id
      WHERE teachers.staff_id = $1 AND teacher_users.deleted_at IS NULL
      `,
      [id],
    );
    return plainToInstance(Teacher, rows[0]);
  }

  async update(
    id: string,
    updated_by: string,
    teacher: NewTeacher,
  ): Promise<Teacher> {
    const rows = await this.databaseService.query(
      `
      UPDATE teachers
      SET name = $1, staff_id = $2, updated_at = NOW()
      WHERE staff_id = $3
      RETURNING *
      `,
      [teacher.name, teacher.staffId, id],
    );
    return plainToInstance(Teacher, rows[0]);
  }

  async delete(id: string, deletedBy: string): Promise<Teacher> {
    const deletedTeacherRows = await this.databaseService.query(
      `
      SELECT * FROM teachers
      WHERE teachers.staff_id = $1
      `,
      [id],
    );
    const deletedTeacher = plainToInstance(Teacher, deletedTeacherRows[0]);
    const deletedTeacherId = deletedTeacher.id;
    const rows = await this.databaseService.query(
      `
      UPDATE teacher_users
      SET deleted_at = NOW(), deleted_by= NULL
      WHERE teacher_users.teacher_id = $1
      RETURNING *
    `,
      [deletedTeacherId],
    );
    return deletedTeacher;
  }
}
