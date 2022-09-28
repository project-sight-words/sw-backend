import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleDestroy,
} from "@nestjs/common";
import { Pool } from "pg";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  static readonly pool = new Pool({
    host: process.env.DB_HOST ?? "sw-db",
    port: parseInt(process.env.DB_PORT ?? "5432"),
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
    database: process.env.DB_NAME ?? "sw-db",
  });

  private readonly loggerService = new Logger("Database Service");

  async query(SQL: string, values?: unknown[]): Promise<unknown[]> {
    try {
      const { rows } = await DatabaseService.pool.query(SQL, values);
      return rows as unknown[];
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.loggerService.error(error);
      }
      throw new InternalServerErrorException();
    }
  }

  async onModuleDestroy() {
    await DatabaseService.pool.end();
  }
}
