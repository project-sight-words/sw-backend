import { DatabaseService } from "database/database.service";
import { Injectable } from "@nestjs/common";
import { NewTeacher, Teacher } from "entities/teacher.entities";
import { plainToInstance } from "class-transformer";

@Injectable()
export class TeachersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(teacher: NewTeacher): Promise<Teacher> {
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
    // const rows = await this.databaseService.query(
    //   `
    //   SELECT * FROM teachers
    //   JOIN teacher_users ON teachers.id = teacher_users.teacher_id
    //   JOIN users ON teacher_users.user_id = users.id
    //   WHERE teacher_users.deleted_at IS NULL
    //   `,
    // );
    const rows = await this.databaseService.query(
      `
        SELECT
          users.id AS id,
          users.email AS email,
          teachers.staff_id AS staff_id,
          teachers.name AS name
        FROM teachers
        JOIN teacher_users
          ON teachers.id = teacher_users.teacher_id
        JOIN users
          ON teacher_users.user_id = users.id;
      `,
      [],
    );
    console.log(rows);
    return plainToInstance(Teacher, rows);
  }

  async getByTeacherId(teacherId: string | null): Promise<Teacher> {
    const teacher = await this.databaseService.transaction(async (query) => {
      const rows = await query(
        `
      SELECT * FROM teachers
      INNER JOIN teacher_users ON teachers.id = teacher_users.teacher_id
      INNER JOIN users ON teacher_users.user_id = users.id
      WHERE teachers.id = $1 AND teacher_users.deleted_at IS NULL
      `,
        [teacherId],
      );
      return plainToInstance(Teacher, rows[0]);
    });
    return teacher;
  }

  async updateByStaffId(
    staffId: string | null,
    updatedBy: string | null,
    teacher: NewTeacher,
  ): Promise<Teacher> {
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

  async deleteByStaffId(
    staffId: string,
    deletedBy: string | null,
  ): Promise<Teacher> {
    const teacherRows = await this.databaseService.query(
      `
      SELECT * FROM teachers
      WHERE teachers.staff_id = $1
      `,
      [staffId],
    );
    const deletedTeacher = plainToInstance(Teacher, teacherRows[0]);
    const deletedTeacherId = deletedTeacher.id;
    const rows = await this.databaseService.query(
      `
      UPDATE teacher_users
      SET deleted_at = NOW(), deleted_by = $2
      WHERE teacher_users.teacher_id = $1
      RETURNING *
    `,
      [deletedTeacherId, deletedBy],
    );
    return deletedTeacher;
  }
}
