import { DatabaseService } from "../../database/database.service";
import { Injectable } from "@nestjs/common";
import { NewUser, User } from "entities/user.entities";
import { plainToInstance } from "class-transformer";
import { Querier } from "database/database.types";

@Injectable()
export class UsersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getByEmail(email: string): Promise<User[]> {
    const rows = await this.databaseService.query(
      `
        SELECT * FROM users
        WHERE email = $1;
      `,
      [email],
    );
    const users = plainToInstance(User, rows);
    return users;
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
    const users = plainToInstance(User, rows);
    return users[0];
  }

  async insert(query: Querier, user: NewUser): Promise<User> {
    const rows = await query(
      `
        INSERT INTO users (email, last_logged_in)
        VALUES ($1, $2)
        RETURNING *;
      `,
      [user.email, user.lastLoggedIn],
    );
    const users = plainToInstance(User, rows);
    return users[0];
  }
}
