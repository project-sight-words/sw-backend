import * as dotenv from "dotenv";
import { Client } from "pg";
import { join } from "path";
import { migrate } from "postgres-migrations";

dotenv.config();

async function main() {
  const client = new Client({
    host: process.env.DB_HOST ?? "sw-db",
    port: parseInt(process.env.DB_PORT ?? "5432"),
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
    database: process.env.DB_NAME ?? "sw-db",
  });

  console.log(`Connecting to database at ${client.host}:${client.port}`);
  await client.connect();

  try {
    console.log("Starting database migrations");
    await migrate({ client }, join(__dirname, "./migrations"));
  } finally {
    console.log("Closing database client");
    await client.end();
  }
}

console.log("Migrations starting");
void main()
  .then(() => console.log("Migrations finished"))
  .catch((err: unknown) => console.error(err));
