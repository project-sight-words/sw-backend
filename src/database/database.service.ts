import { ConfigService } from "@nestjs/config";
import { Pool, PoolClient } from "pg";
import { Querier } from "./database.types";
import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleDestroy,
} from "@nestjs/common";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(private readonly configService: ConfigService) {
    this.pool = new Pool({
      database: this.configService.getOrThrow("DB_NAME"),
      host: this.configService.getOrThrow("DB_HOST"),
      password: this.configService.getOrThrow("DB_PASSWORD"),
      port: this.configService.getOrThrow("DB_PORT"),
      user: this.configService.getOrThrow("DB_USER"),
    });
  }

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
    const query = this.newQuerier(this.pool);
    const rows = await query(SQL, values);
    return rows;
  }

  async transaction<T>(callback: (query: Querier) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
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
      await this.pool.end();
    } catch (error: unknown) {
      this.loggerService.error(error);
      throw new InternalServerErrorException();
    }
  }

  checkIfResultNotEmpty(rows: unknown[]) {
    if (rows.length === 0) {
      throw new HttpException("Resource not found", HttpStatus.NOT_FOUND);
    }
  }
}
