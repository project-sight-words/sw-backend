import { Admin, AdminUser } from "entities/admin.entity";
import { DatabaseService } from "database/database.service";
import { Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";

@Injectable()
export class AdminsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(userId: string): Promise<AdminUser> {
    const createdAdminRows = await this.databaseService.query(
      `
        INSERT INTO admins (id)
        VALUES (DEFAULT)
        RETURNING *;
      `,
    );
    const createdAdmin = plainToInstance(Admin, createdAdminRows[0]);
    const adminId = createdAdmin.id;

    const rows = await this.databaseService.query(
      `
        WITH inserted AS (
          INSERT INTO user_admin (user_id, admin_id, created_at, created_by)
          VALUES ($1, $2, NOW(), NULL)
          RETURNING *
        ) 
        SELECT * FROM inserted
        INNER JOIN users ON user_id = users.id
        INNER JOIN admins ON admin_id = admins.id;
      `,
      [userId, adminId],
    );
    return plainToInstance(AdminUser, rows[0]);
  }

  async getAll(): Promise<AdminUser[]> {
    const rows = await this.databaseService.query(
      `
        SELECT * FROM user_admin
        INNER JOIN users ON user_admin.user_id = users.id
        INNER JOIN admins ON user_admin.admin_id = admins.id
        WHERE user_admin.deleted_at IS NULL;
      `,
    );
    return plainToInstance(AdminUser, rows);
  }

  async getById(id: string): Promise<AdminUser> {
    const rows = await this.databaseService.query(
      `
        SELECT * FROM user_admin 
        INNER JOIN users ON user_admin.user_id = users.id
        INNER JOIN admins ON user_admin.admin_id = admins.id
        WHERE user_admin.deleted_at IS NULL AND user_admin.admin_id = $1;
      `,
      [id],
    );
    return plainToInstance(AdminUser, rows[0]);
  }

  async deleteById(id: string): Promise<AdminUser> {
    const rows = await this.databaseService.query(
      `
        WITH updated AS (
          UPDATE user_admin 
          SET deleted_at = NOW(), deleted_by = NULL 
          WHERE admin_id = $1
          RETURNING *
        ) 
        SELECT * FROM updated
        INNER JOIN users ON user_id = users.id
        INNER JOIN admins ON admin_id = admins.id;
      `,
      [id],
    );
    return plainToInstance(AdminUser, rows[0]);
  }
}
