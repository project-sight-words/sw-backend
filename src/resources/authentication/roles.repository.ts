import { DatabaseService } from "database/database.service";
import { Injectable } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { Roles } from "entities/roles.entities";

@Injectable()
export class RolesRepository {
  private readonly loggerService = new Logger("RolesRepository");

  constructor(private readonly databaseService: DatabaseService) {}

  async getByUserId(userId: string): Promise<Roles[]> {
    const rows = await this.databaseService.query(
      `
        SELECT users.id, student_users.student_id, teacher_users.teacher_id
        FROM users
        LEFT OUTER JOIN student_users
          ON student_users.user_id = users.id
        LEFT OUTER JOIN teacher_users
          ON teacher_users.user_id = users.id AND teacher_users.deleted_at IS NULL
        WHERE users.id = $1;
      `,
      [userId],
    );
    const row = rows[0];
    const roles: Roles[] = [];
    // TODO: Add LEFT OUTER JOIN query for admin_users table
    if ("admin_id" in row && row.admin_id) roles.push(Roles.admin);
    if ("teacher_id" in row && row.teacher_id) roles.push(Roles.teacher);
    if ("student_id" in row && row.student_id) roles.push(Roles.student);
    return roles;
  }
}
