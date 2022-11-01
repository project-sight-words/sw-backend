import { Pool, PoolClient } from "pg";
import { Querier } from "./database.types";
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleDestroy,
} from "@nestjs/common";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  static readonly pool = new Pool({
    host: process.env.DB_HOST ?? "sw-db",
    port: parseInt(process.env.DB_PORT ?? "5432"),
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
    database: process.env.DB_NAME ?? "sw-db",
  });

  private readonly loggerService = new Logger("DatabaseService");

  private newQuerier(client: Pool | PoolClient): Querier {
    const query: Querier = async (SQL, values) => {
      try {
        const { rows } = await client.query(SQL, values);
        if (!Array.isArray(rows)) throw new Error("Rows should be an array");
        if (!rows.every((row) => typeof row === "object"))
          throw new Error("Rows should consist of only objects");
        return rows as object[];
      } catch (error: unknown) {
        this.loggerService.error(error);
        throw new InternalServerErrorException();
      }
    };
    return query;
  }

  async query(SQL: string, values?: unknown[]): Promise<object[]> {
    const query = this.newQuerier(DatabaseService.pool);
    const rows = await query(SQL, values);
    return rows;
  }

  async transaction<T>(callback: (query: Querier) => Promise<T>): Promise<T> {
    const client = await DatabaseService.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(this.newQuerier(client));
      await client.query("COMMIT");
      return result;
    } catch (error: unknown) {
      this.loggerService.error("Rolling back the transaction");
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await DatabaseService.pool.end();
    } catch (error: unknown) {
      this.loggerService.error(error);
      throw new InternalServerErrorException();
    }
  }
}
