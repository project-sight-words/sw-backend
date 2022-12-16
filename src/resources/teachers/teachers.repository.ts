import { DatabaseService } from "database/database.service";
import { Injectable } from "@nestjs/common";
import { isUUID } from "class-validator";
import { plainToInstance } from "class-transformer";
import {
  NewTeacher,
  NewTeacherUser,
  Teacher,
  UpdateTeacher,
} from "entities/teacher.entities";

@Injectable()
export class TeachersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(teacher: NewTeacher): Promise<Teacher> {
    const createdTeacher = await this.databaseService.transaction(
      async (query) => {
        const rows = await query(
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
      },
    );
    return createdTeacher;
  }

  async linkTeacherUser(
    userId: string,
    createdBy: string | null,
    teacherId: string,
  ): Promise<void> {
    await this.databaseService.transaction(async (query) => {
      await query(
        `
          INSERT INTO teacher_users (user_id, teacher_id, created_at, created_by)
          VALUES ($1, $2, NOW(), $3)
          RETURNING *
        `,
        [userId, teacherId, createdBy],
      );
    });
  }

  async get(): Promise<Teacher[]> {
    const teacher = await this.databaseService.transaction(async (query) => {
      const rows = await query(
        `
          SELECT teachers.id, users.email, teachers.staff_id, teachers.name from teachers
          JOIN teacher_users ON teachers.id = teacher_users.teacher_id
          JOIN users on teacher_users.user_id = users.id
          WHERE teacher_users.deleted_at IS NULL
          `,
      );
      return plainToInstance(Teacher, rows);
    });
    console.log(teacher);
    return teacher;
  }

  async getByTeacherId(
    teacherId: string | null,
    isUUID: boolean,
  ): Promise<Teacher> {
    const teacher = await this.databaseService.transaction(async (query) => {
      const rows = await query(
        `
        SELECT teachers.id, users.email, teachers.staff_id, teachers.name from teachers
        JOIN teacher_users ON teachers.id = teacher_users.teacher_id
        JOIN users on teacher_users.user_id = users.id
        WHERE teachers.${
          isUUID ? "id" : "staff_id"
        } = $1 and teacher_users.deleted_at IS NULL
      `,
        [teacherId],
      );
      return plainToInstance(Teacher, rows[0]);
    });
    console.log(teacher);
    return teacher;
  }

  async updateByTeacherId(
    teacherId: string | null,
    updatedBy: string | null,
    teacher: UpdateTeacher,
  ): Promise<Teacher> {
    const updatedTeacher = await this.databaseService.transaction(
      async (query) => {
        const rows = await query(
          `
            UPDATE teachers
            SET name = $1, staff_id = $2, updated_at = NOW()
            WHERE id = $3
            RETURNING *
        `,
          [teacher.name, teacher.staffId, teacherId],
        );
        return plainToInstance(Teacher, rows[0]);
      },
    );
    console.log(updatedTeacher);
    return updatedTeacher;
  }

  async deleteByTeacherId(
    teacherId: string,
    deletedBy: string | null,
  ): Promise<Teacher> {
    const deletedTeacher = await this.databaseService.transaction(
      async (query) => {
        const rows = await query(
          `
            SELECT teachers.id, users.email, teachers.staff_id, teachers.name from teachers
            join teacher_users ON teachers.id = teacher_users.teacher_id
            join users on teacher_users.user_id = users.id
            WHERE teachers.id= $1 and teacher_users.deleted_at IS NULL
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
    console.log(deletedTeacher);
    return deletedTeacher;
  }

  async isLinked(teacherUser: NewTeacherUser): Promise<boolean> {
    const rows = await this.databaseService.query(
      `
        SELECT *
        FROM users
          INNER JOIN teacher_users ON users.id = teacher_users.user_id
          INNER JOIN teachers ON teacher_users.teacher_id = teachers.id
        WHERE users.id = $1 AND teachers.id = $2;
      `,
      [teacherUser.userId, teacherUser.teacherId],
    );

    return rows.length > 0;
  }
}
