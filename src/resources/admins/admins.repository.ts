import { Admin, AdminUser } from "entities/admin.entities";
import { DatabaseService } from "database/database.service";
import { Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { Querier } from "database/database.types";

@Injectable()
export class AdminsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async get(): Promise<Admin[]> {
    const rows = await this.databaseService.query(
      `
        SELECT 
          admins.id AS id,
          users.email AS email
        FROM admins
        JOIN admin_users 
          ON admins.id = admin_users.admin_id
        JOIN users 
          ON admin_users.user_id = users.id
        WHERE admin_users.deleted_at IS NULL;
      `,
    );
    const admins = plainToInstance(Admin, rows);
    return admins;
  }

  async getById(id: string): Promise<Admin[]> {
    const rows = await this.databaseService.query(
      `
        SELECT
          admins.id AS id,
          users.email AS email
        FROM admins
        JOIN admin_users
          ON admins.id = admin_users.admin_id
        JOIN users
          ON admin_users.user_id = users.id
        WHERE admin_users.deleted_at IS NULL AND admin_users.admin_id = $1;
      `,
      [id],
    );
    const admins = plainToInstance(Admin, rows);
    return admins;
  }

  async insert(query: Querier): Promise<string> {
    const rows = (await query(
      `
        INSERT INTO admins (id)
        VALUES (DEFAULT)
        RETURNING id;
      `,
    )) as { id: string }[];
    return rows[0].id;
  }

  async delete(uuid: string): Promise<Admin> {
    const rows = await this.databaseService.query(
      `
        WITH updated AS (
          UPDATE admin_users
          SET updated_at = NOW(), deleted_at = NOW(), deleted_by = NULL
          WHERE admin_users.admin_id = $1
          RETURNING *
        )
        SELECT
          admins.id AS id,
          users.email AS email
        FROM updated
        JOIN users
          ON admin_users.user_id = users.id
        JOIN admins
          ON admin_users.admin_id = admins.id;
      `,
      [uuid],
    );
    const admins = plainToInstance(Admin, rows);
    return admins[0];
  }

  async insertAdminUser(
    query: Querier,
    adminId: string,
    userId: string,
  ): Promise<void> {
    await query(
      `
        INSERT INTO admin_users (user_id, admin_id)
        VALUES ($1, $2);
      `,
      [userId, adminId],
    );
  }

  async getAdminUserByUserId(userId: string): Promise<AdminUser[]> {
    const rows = await this.databaseService.query(
      `
        SELECT *
        FROM users
        JOIN admin_users
          ON users.id = admin_users.user_id
        JOIN admins
          ON admin_users.admin_id = admins.id
        WHERE admin_users.deleted_at IS NULL AND users.id = $2;
      `,
      [userId],
    );
    const adminUsers = plainToInstance(AdminUser, rows);
    return adminUsers;
  }
}
