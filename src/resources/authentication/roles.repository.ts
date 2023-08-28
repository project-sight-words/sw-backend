import { Injectable } from "@nestjs/common";
import { Role } from "entities/roles.entities";
import { DataSource } from "typeorm";
import { RoleDto } from "./dto/authenticate.dto";

@Injectable()
export class RolesRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getByUserId(userId: string): Promise<RoleDto[]> {
    const rows: {
      id: string;
      student_id: string;
      student_name: string;
      teacher_id: string;
      teacher_name: string;
      admin_id: string;
    }[] = (await this.dataSource.createEntityManager().query(
      `
        SELECT users.id,
        student_users.student_id,
        students.name AS student_name,
        teacher_users.teacher_id,
        teachers.name AS teacher_name,
        admin_users.admin_id
        FROM users
                  FULL JOIN student_users
                            ON student_users.user_id = users.id
                  FULL JOIN students ON student_users.student_id = students.id
                  FULL JOIN teacher_users
                            ON teacher_users.user_id = users.id AND teacher_users.deleted_at IS NULL
                  FULL JOIN teachers
                            ON teacher_users.teacher_id = teachers.id
                  FULL JOIN admin_users ON admin_users.user_id = users.id
        WHERE users.id = $1;
      `,
      [userId],
    )) as {
      id: string;
      student_id: string;
      student_name: string;
      teacher_id: string;
      teacher_name: string;
      admin_id: string;
    }[];
    const row = rows[0];
    const roles: RoleDto[] = [];

    if ("admin_id" in row && row.admin_id) {
      roles.push({ role: Role.admin, role_id: row.admin_id });
    }

    if ("teacher_id" in row && row.teacher_id) {
      roles.push({
        role: Role.teacher,
        name: row.teacher_name,
        role_id: row.teacher_id,
      });
    }

    if ("student_id" in row && row.student_id) {
      roles.push({
        role: Role.student,
        name: row.student_name,
        role_id: row.student_id,
      });
    }

    return roles;
  }
}
