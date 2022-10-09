import { DatabaseService } from "../../database/database.service";
import { Injectable } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { NewUser, User } from "../../entities/user.entities";
import { plainToClass } from "class-transformer";

@Injectable()
export class UsersRepository {
  private readonly loggerService = new Logger("UsersRepository");

  constructor(private readonly databaseService: DatabaseService) {}

  async getByEmail(email: string): Promise<User> {
    const rows = await this.databaseService.query(
      `
        SELECT * FROM users
        WHERE email = $1;
      `,
      [email],
    );
    return plainToClass(User, rows[0]);
  }

  async upsertByEmail(user: NewUser): Promise<User> {
    const rows = await this.databaseService.query(
      `
        INSERT INTO users (email, last_logged_in)
        VALUES ($1, $2)
        ON CONFLICT (email)
        DO
        UPDATE SET last_logged_in = $2
        RETURNING *;
        `,
      [user.email, user.lastLoggedIn],
    );
    return plainToClass(User, rows[0]);
  }
}
