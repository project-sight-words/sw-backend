import { Injectable } from "@nestjs/common";
import { Role } from "entities/roles.entities";
import { DataSource } from "typeorm";

@Injectable()
export class RolesRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getByUserId(userId: string): Promise<Role[]> {
    const rows: { id: string; student_id: string; teacher_id: string }[] =
      (await this.dataSource.createEntityManager().query(
        `
        SELECT users.id, student_users.student_id, teacher_users.teacher_id, admin_users.admin_id
        FROM users
                 LEFT OUTER JOIN student_users
                                 ON student_users.user_id = users.id
                 LEFT OUTER JOIN teacher_users
                                 ON teacher_users.user_id = users.id AND teacher_users.deleted_at IS NULL
                 LEFT OUTER JOIN admin_users ON admin_users.user_id = users.id
        WHERE users.id = $1;
      `,
        [userId],
      )) as { id: string; student_id: string; teacher_id: string }[];
    const row = rows[0];
    const roles: Role[] = [];
    if ("admin_id" in row && row.admin_id) roles.push(Role.admin);
    if ("teacher_id" in row && row.teacher_id) roles.push(Role.teacher);
    if ("student_id" in row && row.student_id) roles.push(Role.student);
    return roles;
  }
}
