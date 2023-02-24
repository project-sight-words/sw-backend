import { DatabaseService } from "database/database.service";
import { Injectable } from "@nestjs/common";
import { Querier } from "database/database.types";
import { UserDatum, UserEntity } from "entities/user.entities";

@Injectable()
export class UsersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getByEmail(email: string): Promise<UserEntity[]> {
    const rows = await this.databaseService.query(
      `
        SELECT * FROM users
        WHERE email = $1;
      `,
      [email],
    );
    const users = rows.map((r) => UserEntity.fromObject(r));
    return users;
  }

  async upsertByEmail(datum: UserDatum): Promise<UserEntity> {
    const { email, lastLoggedIn } = datum;
    const rows = await this.databaseService.query(
      `
        INSERT INTO users (email, last_logged_in)
        VALUES ($1, $2)
        ON CONFLICT (email)
        DO
        UPDATE SET last_logged_in = $2
        RETURNING *;
      `,
      [email, lastLoggedIn],
    );
    const users = rows.map((r) => UserEntity.fromObject(r));
    return users[0];
  }

  async insert(query: Querier, datum: UserDatum): Promise<UserEntity> {
    const { email, lastLoggedIn } = datum;
    const rows = await query(
      `
        INSERT INTO users (email, last_logged_in)
        VALUES ($1, $2)
        RETURNING *;
      `,
      [email, lastLoggedIn],
    );
    const users = rows.map((r) => UserEntity.fromObject(r));
    return users[0];
  }
}
