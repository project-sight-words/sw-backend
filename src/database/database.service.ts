import { Injectable } from "@nestjs/common";
import { Pool } from "pg";

@Injectable()
export class DatabaseService {
  static readonly pool = new Pool({
    host: process.env.DB_HOST ?? "localhost",
    port: parseInt(process.env.DB_PORT ?? "5432"),
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
    database: process.env.DB_NAME ?? "sw-db",
  });

  async query(SQL: string, values?: unknown[]): Promise<unknown[]> {
    const { rows } = await DatabaseService.pool.query(SQL, values);
    return rows as unknown[];
  }
}
